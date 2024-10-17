const express = require('express');
const cors = require('cors');
const cluster = require('cluster');
const http = require('http');
const { Server } = require('socket.io');
const redisAdapter = require('socket.io-redis');
const numCPUs = require('os').cpus().length;
const { setupMaster, setupWorker } = require('@socket.io/sticky');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const app = express();
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://zero3062.github.io/Eternal-Return-League',
      ],
    })
  );

  const server = http.createServer(app);
  setupMaster(server, {
    loadBalancingMethod: 'least-connection', // either "random", "round-robin" or "least-connection"
  });

  server.listen(8080, () => {
    console.log(`Worker ${process.pid} started and SERVER IS RUNNING`);
  });

  // 각 CPU에 대해 워커 생성
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 워커가 종료되면 로그를 남기고 새로운 워커를 생성
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://zero3062.github.io/Eternal-Return-League',
      ],
    })
  );

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://zero3062.github.io/Eternal-Return-League',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    allowEIO3: true,
  });

  io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
  setupWorker(io);

  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('send_message', (data) => {
      console.log(data);
      socket.broadcast.emit('receive_message', data);
    });
  });

  server.listen(8080, () => {
    console.log(`Worker ${process.pid} started and SERVER IS RUNNING`);
  });
}
