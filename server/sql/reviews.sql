-- SQL Migration for reviews table (SQLite)

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved_created
ON reviews (approved, created_at DESC);
