const db = require('../lib/db');

if (!db) {
  console.error('Database not available');
  process.exit(1);
}

const rows = db.prepare(
  "SELECT id, name, message, created_at FROM reviews WHERE approved = 0 ORDER BY created_at DESC"
).all();

if (rows.length === 0) {
  console.log('No pending reviews.');
  process.exit(0);
}

console.log(`Pending reviews (${rows.length}):\n`);
rows.forEach(r => {
  console.log(`ID:    ${r.id}`);
  console.log(`Name:  ${r.name}`);
  console.log(`Date:  ${r.created_at}`);
  console.log(`Text:  ${r.message.slice(0, 200)}${r.message.length > 200 ? '...' : ''}`);
  console.log('---');
});
