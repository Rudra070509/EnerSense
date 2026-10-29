/**
 * EnerSense Backend API Server
 * 
 * Handles authentication, profile management, appliance management,
 * energy logging & history, and Gemini AI contextual analysis.
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mqtt = require('mqtt');
const { OAuth2Client } = require('google-auth-library');

// Load environment variables
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

// Initialize Database Tables
const initDB = async () => {
  try {
    // 1. Users table
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
    
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);

    // 2. User Appliances table (Personalized per user, starts as Appliance 1 & Appliance 2)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_appliances (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        channel INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        room VARCHAR(100) DEFAULT 'Living Room',
        type VARCHAR(50) DEFAULT 'light',
        image VARCHAR(255) DEFAULT '/assets/appliance_card1.jpg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_channel UNIQUE (user_id, channel)
      )
    `);

    // 3. Energy Logs table (Continuous history for charts, daily reset, billing & AI)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS energy_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        voltage FLOAT DEFAULT 0,
        current FLOAT DEFAULT 0,
        power FLOAT DEFAULT 0,
        energy_kwh FLOAT DEFAULT 0,
        app1_power FLOAT DEFAULT 0,
        app2_power FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index for fast date queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date 
      ON energy_logs (user_id, created_at DESC)
    `);

    console.log('Database initialized successfully with energy_logs and user_appliances.');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
  }
};
initDB();

// Helper to ensure default appliances exist for a user
const ensureUserAppliances = async (userId) => {
  try {
    const existing = await pool.query('SELECT * FROM user_appliances WHERE user_id = $1 ORDER BY channel ASC', [userId]);
    if (existing.rows.length === 0) {
      await pool.query(`
        INSERT INTO user_appliances (user_id, channel, name, room, type, image)
        VALUES 
          ($1, 1, 'Appliance 1', 'Living Room', 'light', '/assets/appliance_card1.jpg'),
          ($1, 2, 'Appliance 2', 'Living Room', 'tv', '/assets/appliance_card2.jpg')
      `, [userId]);
      const res = await pool.query('SELECT * FROM user_appliances WHERE user_id = $1 ORDER BY channel ASC', [userId]);
      return res.rows;
    }
    return existing.rows;
  } catch (e) {
    console.error('Error ensuring user appliances:', e);
    return [];
  }
};

// --- Background MQTT Telemetry Ingestion ---
// Records real-time snapshots into PostgreSQL for active users
let latestTelemetry = null;
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

mqttClient.on('connect', () => {
  console.log('Backend connected to MQTT broker (broker.hivemq.com:1883)');
  mqttClient.subscribe('enersense/telemetry');
});

mqttClient.on('message', (topic, message) => {
  if (topic === 'enersense/telemetry') {
    try {
      latestTelemetry = JSON.parse(message.toString());
    } catch (e) {
      // ignore parse err
    }
  }
});

// Save snapshot to database every 30 seconds if live readings exist
setInterval(async () => {
  if (!latestTelemetry) return;
  try {
    // Associate with the primary user (e.g. rudrashetye7@gmail.com or primary active user)
    const userRes = await pool.query("SELECT id FROM users WHERE email = 'rudrashetye7@gmail.com' LIMIT 1");
    const targetUserId = userRes.rows[0]?.id || 1;

    const v1 = latestTelemetry.appliance1?.voltage || latestTelemetry.appliance2?.voltage || 0;
    const p1 = latestTelemetry.appliance1?.power || 0;
    const p2 = latestTelemetry.appliance2?.power || 0;
    const totalPower = p1 + p2;
    const totalEnergy = (latestTelemetry.appliance1?.energy || 0) + (latestTelemetry.appliance2?.energy || 0);
    const c1 = latestTelemetry.appliance1?.current || 0;

    // Only log if voltage > 0 (meaning hardware is actively connected)
    if (v1 > 0) {
      await pool.query(`
        INSERT INTO energy_logs (user_id, voltage, current, power, energy_kwh, app1_power, app2_power)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [targetUserId, v1, c1, totalPower, totalEnergy, p1, p2]);
    }
  } catch (err) {
    console.error('Failed to log telemetry snapshot to DB:', err.message);
  }
}, 30000);

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

// 1. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
      [firstName, lastName, email, passwordHash]
    );

    const user = newUser.rows[0];
    await ensureUserAppliances(user.id);

    res.status(201).json({ message: 'User created successfully.', user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await ensureUserAppliances(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Google OAuth Login/Signup
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

    let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
    let user;

    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        'INSERT INTO users (first_name, last_name, email, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [firstName, lastName, email, googleId]
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
      }
    }

    await ensureUserAppliances(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
});

// --- User Profile Routes ---
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updateResult = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3 WHERE id = $4 RETURNING id, first_name, last_name, email, phone, created_at',
      [firstName, lastName, phone, req.user.userId]
    );

    res.status(200).json({ message: 'Profile updated successfully.', user: updateResult.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Dynamic Appliances Routes ---

// 1. Get Logged-in User's Appliances
app.get('/api/appliances', authenticateToken, async (req, res) => {
  try {
    const apps = await ensureUserAppliances(req.user.userId);
    res.status(200).json(apps);
  } catch (err) {
    console.error('Error fetching appliances:', err);
    res.status(500).json({ error: 'Failed to fetch appliances.' });
  }
});

// 2. Rename / Update User's Appliance
app.put('/api/appliances/:channel', authenticateToken, async (req, res) => {
  try {
    const channel = parseInt(req.params.channel, 10);
    const { name, room, type, image } = req.body;

    const updated = await pool.query(`
      UPDATE user_appliances 
      SET 
        name = COALESCE($1, name),
        room = COALESCE($2, room),
        type = COALESCE($3, type),
        image = COALESCE($4, image)
      WHERE user_id = $5 AND channel = $6
      RETURNING *
    `, [name, room, type, image, req.user.userId, channel]);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Appliance not found.' });
    }

    res.status(200).json({ message: 'Appliance updated successfully.', appliance: updated.rows[0] });
  } catch (err) {
    console.error('Error updating appliance:', err);
    res.status(500).json({ error: 'Failed to update appliance.' });
  }
});

// --- Energy History & Stats Routes ---

// 1. Get Today's Energy & Cost (Clean daily reset based on today's midnight)
app.get('/api/energy/today', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(MAX(energy_kwh) - MIN(energy_kwh), 0) as today_kwh,
        COALESCE(AVG(power), 0) as avg_power,
        COALESCE(MAX(power), 0) as peak_power,
        COUNT(*) as log_count
      FROM energy_logs
      WHERE user_id = $1 AND created_at >= CURRENT_DATE
    `, [req.user.userId]);

    const row = result.rows[0] || {};
    res.status(200).json({
      todayKwh: parseFloat(row.today_kwh || 0).toFixed(3),
      avgPower: Math.round(row.avg_power || 0),
      peakPower: Math.round(row.peak_power || 0),
      hasLogsToday: parseInt(row.log_count || 0) > 0
    });
  } catch (err) {
    console.error('Error fetching today energy:', err);
    res.status(500).json({ error: 'Failed to fetch today energy.' });
  }
});

// 2. Get Weekly 7-Day Usage (Real Mon-Sun bars from database)
app.get('/api/energy/weekly', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(d.day, 'Dy') as name,
        d.day::date as date,
        COALESCE(MAX(e.energy_kwh) - MIN(e.energy_kwh), 0) as kwh,
        COALESCE(AVG(e.power), 0) as avg_watts
      FROM (
        SELECT CURRENT_DATE - i as day 
        FROM generate_series(6, 0, -1) as i
      ) d
      LEFT JOIN energy_logs e 
        ON e.user_id = $1 
        AND e.created_at::date = d.day::date
      GROUP BY d.day
      ORDER BY d.day ASC
    `, [req.user.userId]);

    // Format for Recharts
    const chartData = result.rows.map(r => ({
      name: r.name,
      value: Math.round(parseFloat(r.kwh) * 1000) || Math.round(parseFloat(r.avg_watts) * 1.5) || 0, // Watt-hours
      kwh: parseFloat(r.kwh).toFixed(3),
      date: r.date
    }));

    res.status(200).json(chartData);
  } catch (err) {
    console.error('Error fetching weekly energy:', err);
    res.status(500).json({ error: 'Failed to fetch weekly energy.' });
  }
});

// 3. AI Query Helper (Provides genuine DB history to Gemini)
app.get('/api/energy/summary-for-ai', authenticateToken, async (req, res) => {
  try {
    // Today's summary
    const todayRes = await pool.query(`
      SELECT COALESCE(MAX(energy_kwh) - MIN(energy_kwh), 0) as today_kwh,
             COALESCE(AVG(power), 0) as avg_power
      FROM energy_logs 
      WHERE user_id = $1 AND created_at >= CURRENT_DATE
    `, [req.user.userId]);

    // Yesterday's summary
    const yestRes = await pool.query(`
      SELECT COALESCE(MAX(energy_kwh) - MIN(energy_kwh), 0) as yest_kwh,
             COALESCE(AVG(power), 0) as avg_power
      FROM energy_logs 
      WHERE user_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND created_at < CURRENT_DATE
    `, [req.user.userId]);

    // User's appliances
    const appRes = await pool.query(`
      SELECT channel, name, room FROM user_appliances WHERE user_id = $1 ORDER BY channel ASC
    `, [req.user.userId]);

    res.status(200).json({
      todayKwh: parseFloat(todayRes.rows[0]?.today_kwh || 0).toFixed(3),
      todayAvgPower: Math.round(todayRes.rows[0]?.avg_power || 0),
      yesterdayKwh: parseFloat(yestRes.rows[0]?.yest_kwh || 0).toFixed(3),
      yesterdayAvgPower: Math.round(yestRes.rows[0]?.avg_power || 0),
      appliances: appRes.rows
    });
  } catch (err) {
    console.error('Error fetching summary for AI:', err);
    res.status(500).json({ error: 'Failed to fetch AI summary.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`EnerSense Backend Server running on http://localhost:${PORT}`);
});
