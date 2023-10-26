// server/index.js

const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');

app.use(cors());

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('startScreenShare', (data) => {
    const { peerId } = data;
    socket.broadcast.emit('startScreenShare', { peerId });
  });

  socket.on('stopScreenShare', (data) => {
    const { peerId } = data;
    socket.broadcast.emit('stopScreenShare', { peerId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


server.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
