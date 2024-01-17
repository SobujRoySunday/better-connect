import { Server, Socket } from "socket.io";
import http from 'http';
import { UserManager } from "./managers/UserManager";

const server = http.createServer(http);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
  console.log(`New user connected: ${socket.id}`);
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
    userManager.removeUser(socket.id)
  })
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});