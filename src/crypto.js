const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nacl = require('tweetnacl');

const KEYS_PATH = path.join(__dirname, 'keys', 'keys.json');

function ensureKeys() {
  if (!fs.existsSync(path.dirname(KEYS_PATH))) {
    fs.mkdirSync(path.dirname(KEYS_PATH), { recursive: true });
  }
  if (!fs.existsSync(KEYS_PATH)) {
    const kp = nacl.sign.keyPair();
    fs.writeFileSync(KEYS_PATH, JSON.stringify({
      publicKey: Buffer.from(kp.publicKey).toString('base64'),
      secretKey: Buffer.from(kp.secretKey).toString('base64')
    }, null, 2));
  }
  const { publicKey, secretKey } = JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8'));
  return {
    publicKey: Buffer.from(publicKey, 'base64'),
    secretKey: Buffer.from(secretKey, 'base64')
  };
}

const { publicKey, secretKey } = ensureKeys();

function sha384Bytes(input) {
  return crypto.createHash('sha384').update(input).digest(); 
}

function signHash(hashBytes) {
  const sig = nacl.sign.detached(new Uint8Array(hashBytes), new Uint8Array(secretKey));
  return Buffer.from(sig);
}

module.exports = { publicKey, sha384Bytes, signHash };