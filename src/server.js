const express = require('express');
const cors = require('cors');

const { publicKey } = require('./crypto');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/keys/public', (req, res) => {
  res.json({ publicKeyBase64: Buffer.from(publicKey).toString('base64') });
});

const userRouter = require('./users');
app.use('/users',userRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{
    console.log(`App is running on http://localhost:${PORT}`)
})

