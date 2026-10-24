import express from 'express';
import type { Request, Response, NextFunction } from 'express';
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

// Request logger & URL normalization for Vercel Serverless
app.use((req: Request, _res: Response, next: NextFunction) => {
  const forwardedUri =
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-invoke-path'] as string);

  // Normalisation du chemin si Vercel tronque vers /api ou /
  if (forwardedUri && forwardedUri.startsWith('/api') && (req.url === '/' || req.url === '/api' || req.url === '/api/')) {
    req.url = forwardedUri;
  }

  // Journalisation sécurisée dans les logs Vercel (sans secrets)
  console.log(`[Vercel Serverless] ${req.method} ${req.url} (Forwarded: ${forwardedUri || 'none'})`);
  next();
});

// CORS & Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
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

// Global Error Handler pour éviter les crashs 500 HTML sous Vercel
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Vercel Serverless Error] Sur ${req.method} ${req.url} :`, err?.message || err);
  res.status(500).json({
    error: 'Une erreur technique interne est survenue sur le serveur.',
    details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
  });
});

export default app;
