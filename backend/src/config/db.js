const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tour_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
});

// Helper tra ve rows. Khong throw crash app khi goi o top-level.
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getConnection() {
  return pool.getConnection();
}

module.exports = { pool, query, getConnection };
