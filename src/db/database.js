const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            phone TEXT PRIMARY KEY,
            access_token TEXT,
            refresh_token TEXT,
            expiry_date INTEGER
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        }
    });
});

module.exports = db;
