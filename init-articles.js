const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env manual
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('Loading .env file...');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        
        // Split by first =
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Join rest parts in case value contains =
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
} else {
    console.warn('.env file not found!');
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
        console.log('Connecting to database:', dbConfig.host, dbConfig.database);
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS articles (
                id VARCHAR(36) PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                excerpt TEXT,
                content TEXT NOT NULL,
                image_url VARCHAR(255),
                author_id VARCHAR(36),
                status VARCHAR(20) DEFAULT 'published',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        console.log('Executing query...');
        await connection.query(createTableQuery);
        console.log('Table "articles" created or already exists.');

    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
