import express, { Request, Response } from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import Match from './core/Match.ts';
import initializeNamespace from './namespaceEvents.ts';

const app = express();

app.use(express.static(path.join(__dirname, '../public/')));

const httpServer = http.createServer(app);

const server = new Server(httpServer);

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/create-match', (request: Request, response: Response) => {
  const match = new Match([], server);

  initializeNamespace(match);

  response.json({ message: `Created match ${match.getUUID()}` });
});

export default httpServer;

// TODO: /join-match

// TODO: /register-player
