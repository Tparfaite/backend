# QT Mini Admin Panel Backend (Node.js + Express + SQLite + Protobuf + Ed25519)
## This service provides

1. CRUD for users (SQLite, persistent)
2. SHA-384 hashing of email + Ed25519 signature (server-side)
3. Public key endpoint for client-side verification
4. Protobuf export of all users

## Stack
1. Node.js (Express, CORS)
2. SQLite via better-sqlite3
3. Crypto: Node crypto (SHA-384) + tweetnacl (Ed25519)
4. Protobuf: protobufjs

## Pre-requisites  
. Node.js 18+(preferably 20+)
. npm
## How to install and run 
. Copy the project url and open your terminal and run git clone paste the copied url,
. cd backend
. npm install
. npm run dev

### Public signing key
GET /keys/public
{
  "publicKeyBase64": "<base64 Ed25519 public key>"
}
## Users(JSON)

1. GET    /users                  # for listing all users (JSON)
2 GET    /users/:id              # for getting one user (JSON)
3. POST   /users/create           # fro creating (body: { email, role?, status? })
4. PUT    /users/:id              # for updating (body: { email?, role?, status? })
5. DELETE /users/:id             # for deleting
