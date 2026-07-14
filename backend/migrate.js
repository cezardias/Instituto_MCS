const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new Database(dbPath);

try {
  db.exec('ALTER TABLE transactions ADD COLUMN receipt_url TEXT;');
  console.log('Column receipt_url added successfully.');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('Column receipt_url already exists.');
  } else {
    console.error('Error adding column:', e.message);
  }
}
