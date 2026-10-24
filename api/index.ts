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

// Capture des exceptions non gérées pour éviter FUNCTION_INVOCATION_FAILED sous Vercel
process.on('uncaughtException', (err) => {
  console.error('[Vercel Serverless UncaughtException]:', err?.message || err);
});
process.on('unhandledRejection', (reason: any) => {
  console.error('[Vercel Serverless UnhandledRejection]:', reason?.message || reason);
});

console.log('[Vercel Serverless] Initialisation du handler api/index.ts');

// Direct Healthcheck pour diagnostic rapide sans dépendances
app.get(['/api/health', '/health'], async (_req: Request, res: Response) => {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasSecret = !!(process.env.SECRET_KEY || process.env.JWT_SECRET || process.env.APP_SECRET);
  const hasAdminEmail = !!(process.env.ADMIN_EMAIL || process.env.ADMIN_INITIAL_EMAIL);
  const hasAdminPassword = !!(process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD);

  let dbOk = false;
  let dbError: string | null = null;
  if (hasDbUrl) {
    try {
      const { pool } = await import('../src/server/db.ts');
      const test = await pool.query('SELECT 1 as test');
      dbOk = !!test.rows[0];
    } catch (e: any) {
      dbError = e?.message || 'Erreur DB';
    }
  }

  res.json({
    status: 'ok',
    environmentConfigured: {
      DATABASE_URL: hasDbUrl,
      SECRET_KEY: hasSecret,
      ADMIN_EMAIL: hasAdminEmail,
      ADMIN_PASSWORD: hasAdminPassword,
      NODE_ENV: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
    },
    databaseConnected: dbOk,
    databaseError: dbError,
    timestamp: new Date().toISOString(),
  });
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
