/* eslint-disable no-console */
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import EventEmitter from 'events';
import Match from './core/Match.ts';
import initializeNamespace from './namespaceEvents.ts';

const app = express();

app.use(express.static(path.join(__dirname, '../public/')));

const httpServer = http.createServer(app);

const server = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: false,
  },
});

app.use(express.json());
app.use(cors<Request>());

const matches: { [key: string]: Match } = {};

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/create-match', (request: Request, response: Response) => {
  const match = new Match(new EventEmitter(), [], server);

  matches[match.getUUID().replace('/', '')] = match;

  initializeNamespace(match);

  console.debug(`Created match ${match.getUUID()}`);

  response.json({ matchId: match.getUUID() });
});

app.get('/api/get-match/:id', (request: Request, response: Response) => {
  const { id } = request.params;

  const match = matches[id.replace('/', '')];

  if (!match) {
    console.error(`Match ${id} not found.`);
    response.status(404);

    return;
  }

  response.json(match.toJSONObject());
});

app.post('/api/start-match/:id', (request: Request, response: Response) => {
  const { id } = request.params;

  const match = matches[id.replace('/', '')];

  if (!match) {
    response.status(404);

    return;
  }

  match.startMatch();

  response.json({ message: `Started match ${match.getUUID()}` });
});

export default httpServer;
