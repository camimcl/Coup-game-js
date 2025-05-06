import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Match from './core/Match.ts';

const app = express();

const httpServer = http.createServer(app);

const server = new Server(httpServer);

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/create-match', (request: Request, response: Response) => {
  const match = new Match([], server);

  response.json({ message: 'Created match' });
});

export default httpServer;

// TODO: /join-match

// TODO: /register-player
