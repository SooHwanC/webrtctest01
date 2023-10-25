// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", socket => {
  socket.on("join room", roomID => {
    socket.join(roomID);
    socket.to(roomID).emit("other user", socket.id);

    socket.on("offer", (offer, userID) => {
      socket.to(userID).emit("offer", offer, socket.id);
    });

    socket.on("answer", (answer, userID) => {
      socket.to(userID).emit("answer", answer, socket.id);
    });

    socket.on("ice-candidate", (candidate, userID) => {
      socket.to(userID).emit("ice-candidate", { candidate: candidate, id: socket.id });
    });
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
