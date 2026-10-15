import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { pool, isDbConnected } from './src/server/db.ts';
import { adminRouter } from './src/server/adminRoutes.ts';
import {
  INITIAL_PILARS,
  INITIAL_WEEKS,
  INITIAL_CIRCUITS,
  INITIAL_REALISATIONS,
  INITIAL_TESTIMONIALS,
  INITIAL_PARTNERS,
  INITIAL_STATS,
} from './src/server/seedData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve public and uploaded files statically
const publicDir = path.resolve(__dirname, 'public');
const uploadsDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// In-memory fallback stores for demo resilience
const localInscriptions: any[] = [];
const localContactMessages: any[] = [];

// ==========================================
// ROBOTS.TXT & SITEMAP SECURITY DISALLOW
// ==========================================
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /console-*\nDisallow: /api/admin/\n');
});

// ==========================================
// ADMIN & AUTH REST ROUTER
// ==========================================
app.use('/api', adminRouter);

// ==========================================
// PUBLIC REST API ENDPOINTS
// ==========================================

// GET /api/health
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbOk = false;
  let dbError = null;
  try {
    const testRes = await pool.query('SELECT NOW() as current_time');
    dbOk = !!testRes.rows[0];
  } catch (err: any) {
    dbError = err.message;
  }

  res.json({
    status: 'ok',
    neonConnected: dbOk || isDbConnected(),
    databaseStatus: dbOk ? 'Neon PostgreSQL connecté' : 'Mode de secours mémoire activé',
    error: dbError,
    timestamp: new Date().toISOString()
  });
});

// GET /api/programs
app.get('/api/programs', async (_req: Request, res: Response) => {
  try {
    const pilarsRes = await pool.query('SELECT * FROM pilars ORDER BY display_order ASC');
    const weeksRes = await pool.query('SELECT * FROM program_weeks ORDER BY display_order ASC');
    if (pilarsRes.rows.length > 0 && weeksRes.rows.length > 0) {
      return res.json({
        pilars: pilarsRes.rows,
        weeks: weeksRes.rows
      });
    }
  } catch (err) {
    // Graceful fallback to initial seed
  }

  res.json({
    pilars: INITIAL_PILARS,
    weeks: INITIAL_WEEKS
  });
});

// GET /api/circuits
app.get('/api/circuits', async (req: Request, res: Response) => {
  const { region } = req.query;
  try {
    let query = 'SELECT * FROM circuits WHERE (published IS NULL OR published = true)';
    const params: any[] = [];
    if (region && typeof region === 'string' && ['sud', 'centre', 'nord'].includes(region)) {
      query += ' AND region = $1';
      params.push(region);
    }
    query += ' ORDER BY display_order ASC, title ASC';

    const circuitsRes = await pool.query(query, params);
    if (circuitsRes.rows.length > 0) {
      return res.json(circuitsRes.rows);
    }
  } catch (err) {
    // Fallback
  }

  let filtered = INITIAL_CIRCUITS;
  if (region && typeof region === 'string') {
    filtered = filtered.filter(c => c.region === region);
  }
  res.json(filtered);
});

// GET /api/circuits/:slug
app.get('/api/circuits/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const circuitRes = await pool.query('SELECT * FROM circuits WHERE slug = $1', [slug]);
    if (circuitRes.rows.length > 0) {
      return res.json(circuitRes.rows[0]);
    }
  } catch (err) {
    // Fallback
  }

  const found = INITIAL_CIRCUITS.find(c => c.slug === slug);
  if (found) {
    return res.json(found);
  }
  res.status(404).json({ error: 'Circuit non trouvé' });
});

// GET /api/realisations
app.get('/api/realisations', async (_req: Request, res: Response) => {
  try {
    const realisationsRes = await pool.query('SELECT * FROM realisations WHERE (published IS NULL OR published = true) ORDER BY date DESC, display_order ASC');
    if (realisationsRes.rows.length > 0) {
      return res.json(realisationsRes.rows);
    }
  } catch (err) {
    // Fallback
  }
  res.json(INITIAL_REALISATIONS);
});

// GET /api/testimonials
app.get('/api/testimonials', async (_req: Request, res: Response) => {
  try {
    const testRes = await pool.query('SELECT * FROM testimonials WHERE is_published = true ORDER BY display_order ASC');
    if (testRes.rows.length > 0) {
      return res.json(testRes.rows);
    }
  } catch (err) {
    // Fallback
  }
  res.json(INITIAL_TESTIMONIALS);
});

// GET /api/stats
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const statsRes = await pool.query('SELECT * FROM stats ORDER BY display_order ASC');
    if (statsRes.rows.length > 0) {
      return res.json(statsRes.rows);
    }
  } catch (err) {
    // Fallback
  }
  res.json(INITIAL_STATS);
});

// GET /api/partners
app.get('/api/partners', async (_req: Request, res: Response) => {
  try {
    const partRes = await pool.query('SELECT * FROM partners WHERE (is_published IS NULL OR is_published = true) ORDER BY display_order ASC');
    if (partRes.rows.length > 0) {
      return res.json(partRes.rows);
    }
  } catch (err) {
    // Fallback
  }
  res.json(INITIAL_PARTNERS);
});

// POST /api/inscriptions
app.post('/api/inscriptions', async (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    country,
    age,
    motivation,
    consent_contact
  } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'Les champs prénom, nom et e-mail sont obligatoires.' });
  }

  const record = {
    id: 'insc_' + Date.now(),
    first_name,
    last_name,
    email,
    phone: phone || '',
    country: country || 'Bénin',
    age: age ? Number(age) : null,
    motivation: motivation || '',
    consent_contact: consent_contact !== false,
    status: 'nouveau',
    created_at: new Date().toISOString()
  };

  try {
    const dbRes = await pool.query(
      `INSERT INTO inscriptions (first_name, last_name, email, phone, country, age, motivation, consent_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [first_name, last_name, email, phone || null, country || 'Non précisé', age ? Number(age) : null, motivation || null, consent_contact !== false]
    );

    if (dbRes.rows[0]) {
      record.id = dbRes.rows[0].id;
    }
  } catch (err: any) {
    console.warn('[API Inscriptions] Sauvegarde locale :', err.message);
  }

  localInscriptions.push(record);

  res.status(201).json({
    success: true,
    message: 'Votre demande d\'inscription a été enregistrée avec succès. Un membre de l\'équipe ProGen Bénin vous contactera sous 48 h.',
    inscription: record
  });
});

// POST /api/contact
app.post('/api/contact', async (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    country,
    subject,
    message,
    newsletter_optin
  } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Les champs nom, e-mail et message sont obligatoires.' });
  }

  const record = {
    id: 'msg_' + Date.now(),
    name,
    email,
    phone: phone || '',
    country: country || '',
    subject: subject || 'Demande d\'information générale',
    message,
    newsletter_optin: !!newsletter_optin,
    status: 'nouveau',
    created_at: new Date().toISOString()
  };

  try {
    const dbRes = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, country, subject, message, newsletter_optin)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [name, email, phone || null, country || null, subject || 'Information', message, !!newsletter_optin]
    );

    if (dbRes.rows[0]) {
      record.id = dbRes.rows[0].id;
    }
  } catch (err: any) {
    console.warn('[API Contact] Sauvegarde locale :', err.message);
  }

  localContactMessages.push(record);

  res.status(201).json({
    success: true,
    message: 'Merci pour votre message. L\'équipe ProGen Bénin vous répondra sous 48 h ouvrées.',
    data: record
  });
});

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
