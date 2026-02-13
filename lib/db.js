import mysql from 'mysql2/promise';

// Validasi environment — cegah error 'Access denied for user ''@'::1'
const DB_USER = process.env.MYSQL_USER || process.env.DB_USER;
const DB_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
const DB_HOST = process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1';
const DB_NAME = process.env.MYSQL_DATABASE || process.env.DB_NAME;

if (!DB_USER) {
  console.error("FATAL ERROR: DB_USER / MYSQL_USER is missing. Periksa Environment Variables Hostinger!");
}

// Konfigurasi Database — Optimized for shared hosting
const dbConfig = {
  host: DB_HOST,                // Hindari default 'localhost' yang resolve ke ::1 (IPv6) di Hostinger
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,          // ✅ Shared hosting safe
  queueLimit: 0,
  connectTimeout: 5000,         // ✅ Fail fast
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Singleton Pattern untuk Database Pool
let pool;

try {
    if (process.env.NODE_ENV === 'production') {
        pool = mysql.createPool(dbConfig);
    } else {
        if (!global.mysqlPool) {
            console.log('Creating new MySQL connection pool...');
            global.mysqlPool = mysql.createPool(dbConfig);
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
