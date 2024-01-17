import { Server, Socket } from "socket.io";
import http from 'http';
import express from 'express';
import { UserManager } from "./managers/UserManager";

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    userManager.removeUser(socket.id)
  })
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});