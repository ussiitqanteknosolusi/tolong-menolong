
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

async function check() {
  console.log('Connecting to DB...');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.query('SHOW COLUMNS FROM donations');
    console.log('Columns in donations table:');
    rows.forEach(row => {
        console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
