// const {Router} = require('express');
// const { nanoid} = require('nanoid');
// const db = require('./db');

// const { sha384Bytes, signHash } = require('./crypto');

// const router = Router()

// const protobuf = require('protobufjs');
// const path = require('path');

// // const insert = db.prepare(`INSERT INTO users(
// //     id,email,role,status,createdAt)
// //     VALUES(@id,@email,@role,@status,@createdAt)
// // `);

// const update = db.prepare(`
//     UPDATE users SET email=@email,role=@role,status=@status
//     WHERE id=@id
// `);

// const deleteUser = db.prepare(`DELETE FROM users WHERE id=?`);

// const usersList = db.prepare(`SELECT * FROM users ORDER BY datetime(createdAt) DESC`);

// const getOne = db.prepare(`SELECT * FROM users WHERE id=?`);


// // GET ALL USERS
// router.get('/',(req,res)=>{
//     const users=usersList.all()
//     res.json(users)
// });

// // CREATE USER
// router.post('/create',(req,res)=>{
//     const {email, role='user', status='active'} = req.body || {};
//     if(!email){
//         return res.status(400).json({error:"Email is required"});
//     }
//     const id = nanoid();
//     const createdAt =  new Date().toISOString();

//     const email_hash = sha384Bytes(email);       // Buffer
//     const signature = signHash(email_hash);  
     
//     const insertWithCrypto = db.prepare(`
//     INSERT INTO users (id, email, role, status, createdAt, email_hash, signature)
//     VALUES (@id, @email, @role, @status, @createdAt, @email_hash, @signature)
//    `);
//     insertWithCrypto.run({ id, email, role, status, createdAt, email_hash, signature });

//     res.status(201).json({ id, email, role, status, createdAt });

//     insert.run({id,email,role,status,createdAt});
//     res.status(201).json({id,email,role,status,createdAt});
// });


// router.get('/export', async (req, res) => {
//   const rows = list.all();
//   const root = await protobuf.load(path.join(__dirname, 'proto', 'user.proto'));
//   const User = root.lookupType('User');
//   const UserList = root.lookupType('UserList');

//   const users = rows.map(row => User.create({
//     id: row.id,
//     email: row.email,
//     role: row.role,
//     status: row.status,
//     createdAt: row.createdAt,
//     emailHash: row.email_hash,  // Buffer ok for bytes
//     signature: row.signature
//   }));

//   const message = UserList.create({ users });
//   const buffer = UserList.encode(message).finish();

//   res.setHeader('Content-Type', 'application/x-protobuf');
//   res.send(Buffer.from(buffer));
// });

// // UPDATE USER
// router.put('/:id',(req,res)=>{
//     const {id}=req.params;
//     const existingUser = getOne.get(id);
//     if(!existingUser){
//         return res.status(404).json({error:"User not found"})
//     };
//     const {email=existingUser.email, role=existingUser.role, status=existingUser.status} = req.body || {};
//     update.run({id,email,role,status});
//     res.json({id,email,role,status,createdAt:existingUser.createdAt});
// });

// // DELETE USER BY ID
// router.delete('/:id',(req,res)=>{
//     const {id} = req.params;
//     const info = deleteUser.run(id);
//     if(info.changes === 0) return res.status(404).json({error:`user with id ${id} deleted successful`});
//     res.status(204).end()
// });


// // GET ONE USER
// router.get('/:id',(req,res)=>{
//     const {id} =req.params;
//     const user = getOne.get(id);
//     if(user){
//         return res.status(200).json({message:"User retrieved",user:user})
//     }
//     res.status(404).json({error:"User not found"})
// })

// module.exports = router




const { Router } = require('express');
const { nanoid } = require('nanoid');
const db = require('./db');
const { sha384Bytes, signHash } = require('./crypto');

const protobuf = require('protobufjs');
const path = require('path');

const router = Router();

// Prepared statements
const update = db.prepare(`
  UPDATE users SET email=@email, role=@role, status=@status
  WHERE id=@id
`);
const deleteUser = db.prepare(`DELETE FROM users WHERE id=?`);
const usersList  = db.prepare(`SELECT * FROM users ORDER BY datetime(createdAt) DESC`);
const getOne     = db.prepare(`SELECT * FROM users WHERE id=?`);

// GET ALL USERS
router.get('/', (req, res) => {
  const users = usersList.all();
  res.json(users);
});

// CREATE USER  (currently POST /users/create)
router.post('/create', (req, res) => {
  const { email, role = 'user', status = 'active' } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const id = nanoid();
  const createdAt = new Date().toISOString();

  // crypto: hash email then sign the hash
  const email_hash = sha384Bytes(email);   // Buffer
  const signature  = signHash(email_hash); // Buffer

  const insertWithCrypto = db.prepare(`
    INSERT INTO users (id, email, role, status, createdAt, email_hash, signature)
    VALUES (@id, @email, @role, @status, @createdAt, @email_hash, @signature)
  `);
  insertWithCrypto.run({ id, email, role, status, createdAt, email_hash, signature });

  // respond once
  res.status(201).json({ id, email, role, status, createdAt });
});

// EXPORT (protobuf)
router.get('/export', async (req, res) => {
  const rows = usersList.all(); // <-- fixed name
  const root = await protobuf.load(path.join(__dirname, 'proto', 'user.proto'));
  const User = root.lookupType('User');
  const UserList = root.lookupType('UserList');

  const users = rows.map(row => User.create({
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt,
    emailHash: row.email_hash,   // Buffer ok for bytes
    signature: row.signature
  }));

  const message = UserList.create({ users });
  const buffer = UserList.encode(message).finish();

  res.setHeader('Content-Type', 'application/x-protobuf');
  res.send(Buffer.from(buffer));
});

// UPDATE USER
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existingUser = getOne.get(id);
  if (!existingUser) return res.status(404).json({ error: 'User not found' });

  const { email = existingUser.email, role = existingUser.role, status = existingUser.status } = req.body || {};
  update.run({ id, email, role, status });
  res.json({ id, email, role, status, createdAt: existingUser.createdAt });
});

// DELETE USER BY ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const info = deleteUser.run(id);
  if (info.changes === 0) return res.status(404).json({ error: `User ${id} not found` });
  res.status(204).end();
});

// GET ONE USER
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = getOne.get(id);
  if (user) return res.status(200).json({ message: 'User retrieved', user });
  res.status(404).json({ error: 'User not found' });
});

module.exports = router;

