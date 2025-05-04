import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import embassadorTree from './core/actions/trees/embassador';
import GameState from './core/GameState';

const app = express();
const httpServer = http.createServer(app);
export const server = new Server(httpServer);

// serve your static client, etc.
app.use(express.static(path.join(__dirname, '../public/')));

server.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // when the client says “start”, run the tree
  socket.on('create_room', () => {
    server.of('/').adapter.on('create-room', (room) => {
      console.log(`room ${room} was created`);
    });

    server.of('/').adapter.on('join-room', (room, id) => {
      console.log(`socket ${id} has joined room ${room}`);
    });

    const gameState = new GameState([]);

    socket.join(gameState.uuid);

    // const tree = embassadorTree;
    //
    // tree
    //   .execute(gameState)
    //   .then(() => console.log('Tree finished for', socket.id))
    //   .catch((err) => console.error('Tree error:', err));
  });
});

httpServer.listen(3000, () => console.log('Listening on :3000'));
