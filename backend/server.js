const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

// Load environment variables from the parent directory's .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Table
const initDB = async () => {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Modify table to support Google Auth (nullable passwords, google_id)
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`);

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database. Make sure DATABASE_URL is correct.', err.message);
  }
};
initDB();

// --- Auth Routes ---

// 1. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
      [firstName, lastName, email, passwordHash]
    );

    res.status(201).json({ message: 'User created successfully.', user: newUser.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Google OAuth Route
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the token with Google
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;
    
    // Check if user exists by email or google_id
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    
    if (userCheck.rows.length > 0) {
      // User exists, just log them in (and update google_id if missing)
      user = userCheck.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
      }
    } else {
      // Create new user without a password
      const newUser = await pool.query(
        'INSERT INTO users (first_name, last_name, email, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [firstName, lastName || '', email, googleId]
      );
      user = newUser.rows[0];
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Google login successful.',
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(401).json({ error: 'Invalid Google token.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
