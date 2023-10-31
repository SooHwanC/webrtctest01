const express = require('express');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);


// SSL cert for HTTPS access
const options = {
  key: fs.readFileSync('./private.key'),
  cert: fs.readFileSync('./certificate.crt')
}

const httpsServer = https.createServer(options, app)
httpsServer.listen(5000, () => {
  console.log('listening on port: ' + 5000)
})

const io = socketIo(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  socket.on('stop-sharing', () => {
    socket.broadcast.emit('stop-sharing');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
