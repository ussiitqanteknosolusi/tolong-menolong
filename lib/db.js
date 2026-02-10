import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DATABASE || 'db_tolongmenolong',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
let pool = null;

export async function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('MySQL pool created successfully');
    } catch (error) {
      console.error('Error creating MySQL pool:', error);
      throw error;
    }
  }
  return pool;
}

export async function query(sql, params = []) {
  try {
    const pool = await getPool();
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getConnection() {
  const pool = await getPool();
  return pool.getConnection();
}

// Helper functions for common operations
export async function findOne(table, conditions) {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const results = await query(sql, values);
  return results[0] || null;
}

export async function findMany(table, conditions = {}, options = {}) {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  
  let sql = `SELECT * FROM ${table}`;
  
  if (keys.length > 0) {
    const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
    sql += ` WHERE ${whereClause}`;
  }
  
  if (options.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }
  
  if (options.limit) {
    sql += ` LIMIT ${options.limit}`;
  }
  
  if (options.offset) {
    sql += ` OFFSET ${options.offset}`;
  }
  
  return query(sql, values);
}

export async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await query(sql, values);
  return result;
}

export async function update(table, data, conditions) {
  const dataKeys = Object.keys(data);
  const dataValues = Object.values(data);
  const condKeys = Object.keys(conditions);
  const condValues = Object.values(conditions);
  
  const setClause = dataKeys.map(key => `${key} = ?`).join(', ');
  const whereClause = condKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await query(sql, [...dataValues, ...condValues]);
  return result;
}

export async function remove(table, conditions) {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await query(sql, values);
  return result;
}

// Test connection
export async function testConnection() {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();
    console.log('MySQL connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    return false;
  }
}
