const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
const nacl = require('tweetnacl');

(async () => {
  const keysPath = path.join(__dirname, '..', 'src', 'keys', 'keys.json');
  const { publicKey } = JSON.parse(fs.readFileSync(keysPath, 'utf-8'));
  const pubKey = Uint8Array.from(Buffer.from(publicKey, 'base64'));

  
  const binPath =
    fs.existsSync(path.join(__dirname, '..', 'users.bin'))
      ? path.join(__dirname, '..', 'users.bin')
      : path.join(__dirname, '..', 'samples', 'users.bin');

  const buf = fs.readFileSync(binPath);

 
  const root = await protobuf.load(path.join(__dirname, '..', 'src', 'proto', 'user.proto'));
  const UserList = root.lookupType('UserList');
  const decoded = UserList.decode(new Uint8Array(buf));

  let ok = 0;
  for (const u of decoded.users) {
    const emailHash = Uint8Array.from(u.emailHash);
    const sig = Uint8Array.from(u.signature);
    const valid = nacl.sign.detached.verify(emailHash, sig, pubKey);
    console.log(`${u.email.padEnd(28)} -> ${valid ? 'VALID' : 'INVALID'}`);
    if (valid) ok++;
  }
  console.log(`\nVerified ${ok}/${decoded.users.length} signatures.`);
})();
