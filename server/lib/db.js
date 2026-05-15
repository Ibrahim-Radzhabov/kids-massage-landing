const Database = require('better-sqlite3');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/reviews.db';

let db = null;

try {
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_approved_created
    ON reviews (approved, created_at DESC);
  `);
} catch (err) {
  console.error('Failed to initialize SQLite database:', err.message);
}

module.exports = db;
