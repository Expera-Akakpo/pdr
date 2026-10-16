import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { mainApi } from '../src/server/mainApi.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS Configuration
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

// Support both /api/... and /... in case of Vercel serverless path rewrites
app.use('/api', mainApi);
app.use('/', mainApi);

export default app;
