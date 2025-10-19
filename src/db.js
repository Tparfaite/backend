const Database = require('better-sqlite3');

const db = new Database('data.sqlite');

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    email_hash BLOB,
    signature BLOB
    );
`);

module.exports = db    