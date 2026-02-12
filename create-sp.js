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
  multipleStatements: true 
};

async function main() {
    let connection;
    try {
        console.log('Creating Stored Procedures...');
        connection = await mysql.createConnection(dbConfig);

        // Drop if exists first to avoid error
        await connection.query("DROP PROCEDURE IF EXISTS sp_update_campaign_amount");

        const createSPQuery = `
            CREATE PROCEDURE sp_update_campaign_amount(IN p_campaign_id VARCHAR(36), IN p_amount DECIMAL(15,2))
            BEGIN
                UPDATE campaigns 
                SET current_amount = current_amount + p_amount,
                    donor_count = donor_count + 1,
                    updated_at = NOW()
                WHERE id = p_campaign_id;
            END
        `;

        await connection.query(createSPQuery);
        console.log('Success: sp_update_campaign_amount created.');
        
        // Cek SP lain yang mungkin dibutuhkan (process_payment, process_topup)
        // sp_process_payment biasanya dipanggil oleh webhook payment gateway
        // Jika ada error di webhook nanti, perlu SP ini juga.
        // Tapi sementara fokus ke recurring donation error.

    } catch (error) {
        console.error('Error creating SP:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
