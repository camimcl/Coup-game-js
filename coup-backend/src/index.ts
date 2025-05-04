import express, { Request, Response } from 'express';
import Match from './core/Match';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
