const Database = require('better-sqlite3');
const { sha384Bytes, signHash } = require('../src/crypto');

const db = new Database('data.sqlite');

const badRows = db.prepare(`
  SELECT id, email FROM users
  WHERE signature IS NULL
     OR email_hash IS NULL
     OR length(signature) <> 64
     OR length(email_hash) <> 48
`).all();

console.log(`Found ${badRows.length} rows to fix...`);

const upd = db.prepare(`
  UPDATE users
  SET email_hash=@email_hash, signature=@signature
  WHERE id=@id
`);

for (const r of badRows) {
  const email_hash = sha384Bytes(r.email);  
  const signature  = signHash(email_hash);   
  upd.run({ id: r.id, email_hash, signature });
}

console.log('Done.');
