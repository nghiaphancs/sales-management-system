import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/api';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '2mb' }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', apiRouter);

  return app;
};
