
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const dbConfig = {
  host: env.MYSQL_HOST,
  port: parseInt(env.MYSQL_PORT || '3306'),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
};

async function migrate() {
  console.log('Connecting and adding paid_at column...');
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.query("ALTER TABLE donations ADD COLUMN paid_at TIMESTAMP NULL");
    console.log('Successfully added paid_at to donations table.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Column paid_at already exists.');
    } else {
        console.error('Migration failed:', err);
    }
  } finally {
    await connection.end();
  }
}

migrate();
