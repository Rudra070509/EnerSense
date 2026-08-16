const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Load environment variables from the parent directory's .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
    
    // Modify table to support Google Auth and Password Resets
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);

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

// 4. Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Return 200 even if not found to prevent email enumeration
      return res.status(200).json({ message: 'If the email exists, a reset link was sent.' });
    }

    const user = userResult.rows[0];

    // Check if user is purely a Google login user (they shouldn't have passwords)
    if (!user.password_hash && user.google_id) {
      return res.status(400).json({ error: 'This account uses Google Sign-In. Please log in with Google.' });
    }

    // Generate token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save to DB
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, expiry, user.id]
    );

    // Send Email
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'EnerSense - Password Reset Request',
      html: `
        <h2>EnerSense Password Reset</h2>
        <p>You requested a password reset. Click the button below to choose a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #3b82f6; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);

    res.status(200).json({ message: 'If the email exists, a reset link was sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by valid token
    const userResult = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const user = userResult.rows[0];

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update DB and clear token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
