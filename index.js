const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(
    cors({
      origin: ['http://localhost:3000', 'https://zero3062.github.io/Eternal-Return-League'],
    })
  );
const server = http.createServer(app);

var io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
          const allowedOrigins = [
            "https://zero3062.github.io/Eternal-Return-League",
            "http://localhost:3000"
          ];
    
          if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // 허용된 오리진이거나 origin이 없으면 허용
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("send_message", (data) => {
    console.log(data)
    socket.broadcast.emit("receive_message", data); 
  });
});

server.listen(8080, () => {
  console.log("SERVER IS RUNNING");
});