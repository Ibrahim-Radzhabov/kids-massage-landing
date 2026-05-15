const db = require('../lib/db');

const id = process.argv[2];
if (!id) {
  console.error('Usage: node approve-review.js <review_id>');
  process.exit(1);
}

if (!db) {
  console.error('Database not available');
  process.exit(1);
}

const result = db.prepare(
  "UPDATE reviews SET approved = 1 WHERE id = ?"
).run(id);

if (result.changes === 0) {
  console.error(`Review not found: ${id}`);
  process.exit(1);
}

console.log(`Review approved: ${id}`);
