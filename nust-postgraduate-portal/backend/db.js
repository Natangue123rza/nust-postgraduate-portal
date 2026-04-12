// backend/db.js
const mysql = require('mysql2')
require('dotenv').config()

// Create connection pool
// A pool manages multiple connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
})

// Convert pool to use promises
const poolPromise = pool.promise()

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err)
    return
  }
  console.log('✅ Connected to MySQL successfully!')
  connection.release()
})

module.exports = { poolPromise }