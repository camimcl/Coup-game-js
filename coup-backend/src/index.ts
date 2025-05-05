import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import embassadorTree from './core/actions/trees/embassador';
import GameState from './core/GameState';
import Player from './core/Player';

const app = express();
const httpServer = http.createServer(app);
export const server = new Server(httpServer);

// serve your static client, etc.
app.use(express.static(path.join(__dirname, '../public/')));

const gameState = new GameState([]);

server.of(`/${gameState.uuid}`).on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  const player = new Player(socket.id, socket);

  gameState.addPlayer(player);

  socket.on('start', () => {
    const tree = embassadorTree;

    tree
      .execute(gameState, server.of(`/${gameState.uuid}`))
      .then(() => console.log('Tree finished for', socket.id))
      .catch((err) => console.error('Tree error:', err));
  });
});
httpServer.listen(3000, () => console.log('Listening on :3000'));
