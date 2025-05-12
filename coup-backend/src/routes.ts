import express, { Request, Response } from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import EventEmitter from 'events';
import Match from './core/Match.ts';
import initializeNamespace from './namespaceEvents.ts';

const app = express();

app.use(express.static(path.join(__dirname, '../public/')));

const httpServer = http.createServer(app);

const server = new Server(httpServer);

app.use(express.json());

const matches: { [key: string]: Match } = {};

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/create-match', (request: Request, response: Response) => {
  const match = new Match(new EventEmitter(), [], server);

  matches[match.getUUID().replace('/', '')] = match;

  initializeNamespace(match);

  response.json({ message: `Created match ${match.getUUID()}` });
});

app.post('/start-match/:id', (request: Request, response: Response) => {
  const { id } = request.params;

  const match = matches[id];

  if (!match) {
    response.json({ message: `Unable to find match ${id}` });
    return;
  }

  match.startMatch();

  response.json({ message: `Started match ${match.getUUID()}` });
});

export default httpServer;

// TODO: /join-match

// TODO: /register-player
