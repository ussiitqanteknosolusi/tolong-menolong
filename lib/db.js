import mysql from 'mysql2/promise';

// Konfigurasi Database — Optimized for shared hosting
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,        // ✅ Shared hosting safe (was 50, causes connection exhaustion)
  queueLimit: 0,
  connectTimeout: 5000,       // ✅ Fail fast (was 10000)
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Singleton Pattern untuk Database Pool
let pool;

try {
    if (process.env.NODE_ENV === 'production') {
        // Di production, buat pool baru langsung
        pool = mysql.createPool(dbConfig);
    } else {
        // Di development, cek global variable untuk mencegah double connection saat reload
        if (!global.mysqlPool) {
            console.log('Creating new MySQL connection pool...');
            global.mysqlPool = mysql.createPool(dbConfig);
        } else {
            // Gunakan pool yang sudah ada
            // console.log('Using existing MySQL connection pool');
        }
        pool = global.mysqlPool;
    }
} catch (error) {
    console.error('Failed to initialize MySQL pool:', error);
}

// Fungsi utama untuk query
export async function query(sql, params) {
  try {
    if (!pool) throw new Error('Database pool not initialized');
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database Query Error:', error.message);
    throw error;
  }
}

// Helper untuk INSERT
export async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  return await query(sql, values);
}

// Helper untuk UPDATE
export async function update(table, data, conditions) {
  const updates = Object.keys(data).map((key) => `${key} = ?`).join(', ');
  const updateValues = Object.values(data);
  
  const whereClause = Object.keys(conditions).map((key) => `${key} = ?`).join(' AND ');
  const whereValues = Object.values(conditions);
  
  const sql = `UPDATE ${table} SET ${updates} WHERE ${whereClause}`;
  return await query(sql, [...updateValues, ...whereValues]);
}

// Helper untuk SINGLE SELECT (findOne)
export async function findOne(table, conditions) {
  const whereClause = Object.keys(conditions).map((key) => `${key} = ?`).join(' AND ');
  const whereValues = Object.values(conditions);
  
  const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const rows = await query(sql, whereValues);
  return rows.length > 0 ? rows[0] : null;
}

// Helper untuk DELETE (remove)
export async function remove(table, conditions) {
  const whereClause = Object.keys(conditions).map((key) => `${key} = ?`).join(' AND ');
  const whereValues = Object.values(conditions);
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  return await query(sql, whereValues);
}

// Helper untuk cek koneksi
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('Test connection failed:', error);
    return false;
  }
}

// Backward compatibility jika ada code lama yang memanggil getPool()
export async function getPool() {
    return pool;
}
