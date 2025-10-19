
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');

(async () => {
  const binPath = path.join(process.cwd(), 'users.bin'); 
  const buf = fs.readFileSync(binPath);

  const root = await protobuf.load(path.join(__dirname, '..', 'src', 'proto', 'user.proto'));
  const UserList = root.lookupType('UserList');

  const decoded = UserList.decode(new Uint8Array(buf));
  
  const users = decoded.users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    emailHash_b64: Buffer.from(u.emailHash).toString('base64'),
    signature_b64: Buffer.from(u.signature).toString('base64'),
  }));

  console.log(JSON.stringify({ count: users.length, users }, null, 2));
})();
