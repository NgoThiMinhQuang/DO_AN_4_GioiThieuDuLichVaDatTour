require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { pool } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/meta', require('./routes/meta'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/admin', require('./routes/admin'));

// 404 JSON
app.use((req, res) => res.status(404).json({ message: 'Khong tim thay API' }));

// Error handler JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Loi server' });
});

// Tu tao bang roles/users toi thieu neu DB chua co schema
// de `npm start` khong crash khi chua import sql/.
async function ensureMinimalTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`INSERT IGNORE INTO roles (id, name, description) VALUES
    (1,'CUSTOMER','Khach hang'),(2,'STAFF','Nhan vien'),(3,'ADMIN','Quan tri vien')`);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE NULL,
    gender ENUM('MALE','FEMALE','OTHER') NULL,
    address VARCHAR(255) NULL,
    avatar VARCHAR(500) NULL,
    role_id INT NOT NULL DEFAULT 1,
    status ENUM('ACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    await ensureMinimalTables();
    console.log('[db] connected, minimal tables ensured');
  } catch (e) {
    console.error('[db] khong ket noi duoc MySQL, van listen (import backend/sql/*.sql de day du):', e.message);
  }
  app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
}

start();

module.exports = app;
