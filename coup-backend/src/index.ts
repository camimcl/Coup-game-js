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

  const gameState = new GameState([]);

  // when the client says “start”, run the tree
  socket.on('create_room', () => {
    server.of(`/${gameState.uuid}`).adapter.on('create-room', (room) => {
      console.log(`room ${room} was created`);
    });

    server.of(`/${gameState.uuid}`).adapter.on('join-room', (room, id) => {
      console.log(`socket ${id} has joined room ${room}`);

      socket.on('disconnect', () => {
        console.log('Leaving room ', room);

        socket.leave(room);
      });
    });

    socket.join(`${gameState.uuid}`);

    // const tree = embassadorTree;
    //
    // tree
    //   .execute(gameState)
    //   .then(() => console.log('Tree finished for', socket.id))
    //   .catch((err) => console.error('Tree error:', err));
  });
});
httpServer.listen(3000, () => console.log('Listening on :3000'));
