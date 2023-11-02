const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
// const https = require('https');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());

const server = http.createServer(app);
// const options = {
//   key: fs.readFileSync('./private.key'),
//   cert: fs.readFileSync('./certificate.crt')
// };



// const server = https.createServer(options, (req, res) => {
//   res.writeHead(200);
//   res.end('Hello, this is an HTTPS server!');
// })

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('offer', (data) => {
    console.log('노드 오퍼 데이터 확인', data);
    socket.broadcast.emit('new-peer', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('remote-stream', (base64data) => {
    console.log('base64data 확인', base64data);
    socket.broadcast.emit('new-peer', base64data);
  });

  socket.on('share-screen', (stream) => {
    console.log('share-screen 실행');
    console.log('stream 확인', stream);
    // 클라이언트로부터 전송된 스트림을 다른 클라이언트들에게 브로드캐스팅
    socket.broadcast.emit('shared-screen', stream);
  });

  socket.on('shareScreen', (videoTrack) => {
    console.log('받은 트랙', videoTrack);
    // 클라이언트에게 화면 정보 전송
    io.emit('sharedScreen', videoTrack);
  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
