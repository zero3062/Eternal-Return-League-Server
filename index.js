const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://zero3062.github.io',
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const server = http.createServer(app);

var io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://zero3062.github.io',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('send_message', (data) => {
    console.log(data);
    socket.broadcast.emit('receive_message', data);
  });

  socket.on("disconnect", (reason) => {
    console.log(`User Disconnected: ${reason}`);
  });
});

server.listen(8080, () => {
  console.log('SERVER IS RUNNING');
});
