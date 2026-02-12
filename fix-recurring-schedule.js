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
        console.log('Update schedule recurring donations...');
        connection = await mysql.createConnection(dbConfig);
        
        // Paksa semua recurring 'minute' untuk dieksekusi sekarang (set next_execution_at ke masa lalu)
        const [result] = await connection.query(`
            UPDATE recurring_donations 
            SET next_execution_at = DATE_SUB(NOW(), INTERVAL 1 MINUTE)
            WHERE frequency = 'minute' AND is_active = 1
        `);
        
        console.log('Fixed', result.changedRows, 'rows. Ready to be processed by Cron.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
