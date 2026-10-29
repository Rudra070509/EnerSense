require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function runInit() {
  try {
    console.log('Connecting to NeonDB...');
    
    // Create user_appliances
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
      );
    `);
    console.log('user_appliances table verified.');

    // Create energy_logs
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
      );
    `);
    console.log('energy_logs table verified.');

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date 
      ON energy_logs (user_id, created_at DESC);
    `);

    // Ensure all existing users in the db have default appliances
    const users = await pool.query('SELECT id FROM users');
    for (const u of users.rows) {
      await pool.query(`
        INSERT INTO user_appliances (user_id, channel, name, room, type, image)
        VALUES 
          ($1, 1, 'Appliance 1', 'Living Room', 'light', '/assets/appliance_card1.jpg'),
          ($1, 2, 'Appliance 2', 'Living Room', 'tv', '/assets/appliance_card2.jpg')
        ON CONFLICT (user_id, channel) DO NOTHING;
      `, [u.id]);
    }

    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('All Tables Now in Database:', tables.rows.map(r => r.tablename));
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runInit();
