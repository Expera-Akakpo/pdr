import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { mainApi } from './src/server/mainApi.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve public and uploaded files statically
const publicDir = path.resolve(__dirname, 'public');
const uploadsDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch {
    // Ignore in read-only filesystems
  }
}
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// ROBOTS.TXT & SITEMAP SECURITY DISALLOW
// ==========================================
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /admin_pdr*\nDisallow: /api/admin/\n');
});

// ==========================================
// REST API ENDPOINTS
// ==========================================
app.use('/api', mainApi);

// ==========================================
// VITE DEV SERVER / STATIC ASSETS HANDLER
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Pont des Deux Rives] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
