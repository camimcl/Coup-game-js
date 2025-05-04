import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { makeCaptureTree } from './core/buildTree';
import { GameContext } from './core/tree';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve your static client, etc.
app.use(express.static(path.join(__dirname, '../public/')));

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // initialize per‐player game state
  const ctx: GameContext = {
    socket,
    player2Moves: 3,
    coins: 10,
  };

  // when the client says “start”, run the tree
  socket.on('start', () => {
    const tree = makeCaptureTree();
    tree
      .execute(ctx)
      .then(() => console.log('Tree finished for', socket.id))
      .catch((err) => console.error('Tree error:', err));
  });
});

server.listen(3000, () => console.log('Listening on :3000'));
