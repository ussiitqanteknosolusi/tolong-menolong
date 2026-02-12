const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (!line || line.startsWith('#')) return;
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

async function main() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query("SELECT * FROM recurring_donations");
        const data = rows.map(r => ({
            id: r.id,
            frequency: r.frequency,
            next_execution_at: new Date(r.next_execution_at).toString(),
            is_active: r.is_active
        }));
        fs.writeFileSync('check-result.txt', JSON.stringify(data, null, 2));
        console.log('Result written to check-result.txt');
        
        // Cek juga user balance
        if(rows.length > 0) {
            const userId = rows[0].user_id;
            const [users] = await connection.query("SELECT id, name, balance FROM users WHERE id = ?", [userId]);
            console.log('User Balance:', users[0]);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
