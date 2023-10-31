const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const https = require('https');
const fs = require('fs');

const app = express();
// const server = http.createServer(app);
const options = {
  key: fs.readFileSync('./private.key'),
  cert: fs.readFileSync('./certificate.crt')
};



const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello, this is an HTTPS server!');
})

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('offer', (data) => {
    socket.broadcast.emit('new-peer', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('remote-stream', (base64data) => {
    socket.broadcast.emit('new-peer', base64data);
  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
