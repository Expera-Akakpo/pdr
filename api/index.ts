import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { mainApi } from '../src/server/mainApi.ts';

dotenv.config();

const app = express();

// Trust reverse proxy (Vercel edge & proxies) for secure cookies and correct client IP
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS & Security headers
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Support both /api/... and root-level /... for resilient Vercel routing
app.use('/api', mainApi);
app.use('/', mainApi);

export default app;
