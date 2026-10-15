import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { pool } from './db.ts';
import {
  requireAuth,
  requireRole,
  signToken,
  logActivity,
  checkLoginRateLimit,
  resetLoginRateLimit,
  AuthenticatedRequest,
} from './auth.ts';
import { saveFile } from './storage.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const adminRouter = Router();

// ==========================================
// 1. AUTHENTIFICATION
// ==========================================

// POST /api/auth/login
adminRouter.post('/auth/login', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil(rateLimit.remainingMs / 60000);
    return res.status(429).json({
      error: `Trop de tentatives infructueuses. Veuillez patienter ${minutes} minute(s).`,
    });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const userRes = await pool.query(
      'SELECT id, email, password_hash, name, role, is_active FROM admin_users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Ce compte administrateur a été désactivé.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    resetLoginRateLimit(ip);

    // Update last_login
    await pool.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(payload);

    // Set HTTP-only cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8h
    });

    await logActivity(user.id, 'login', 'auth', user.id, { email: user.email });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('[Admin Auth] Erreur login :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});

// POST /api/auth/logout
adminRouter.post('/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('admin_token');
  if (req.adminUser) {
    await logActivity(req.adminUser.userId, 'logout', 'auth', req.adminUser.userId);
  }
  res.json({ success: true, message: 'Déconnexion effectuée.' });
});

// GET /api/auth/me
adminRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.adminUser,
  });
});

// POST /api/auth/change-password
adminRouter.post('/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' });
  }

  try {
    const userRes = await pool.query('SELECT password_hash FROM admin_users WHERE id = $1', [req.adminUser?.userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [newHash, req.adminUser?.userId]);
    await logActivity(req.adminUser?.userId, 'change_password', 'auth', req.adminUser?.userId);

    res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe.' });
  }
});

// ==========================================
// 2. TABLEAU DE BORD (DASHBOARD STATS)
// ==========================================
adminRouter.get('/admin/dashboard', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [realisationsCount, circuitsCount, inscriptionsCount, messagesCount, newsletterCount, recentLogs] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM realisations'),
      pool.query('SELECT COUNT(*) FROM circuits'),
      pool.query("SELECT COUNT(*) FROM inscriptions WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM contact_messages WHERE status = 'nouveau'"),
      pool.query('SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true'),
      pool.query(`
        SELECT a.id, a.action, a.entity, a.details, a.created_at, u.name as admin_name
        FROM activity_log a
        LEFT JOIN admin_users u ON a.admin_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 10
      `),
    ]);

    res.json({
      counts: {
        realisations: parseInt(realisationsCount.rows[0]?.count || '0', 10),
        circuits: parseInt(circuitsCount.rows[0]?.count || '0', 10),
        newInscriptions7d: parseInt(inscriptionsCount.rows[0]?.count || '0', 10),
        unreadMessages: parseInt(messagesCount.rows[0]?.count || '0', 10),
        activeSubscribers: parseInt(newsletterCount.rows[0]?.count || '0', 10),
      },
      recentActivities: recentLogs.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des indicateurs du tableau de bord.' });
  }
});

// ==========================================
// 3. RÉALISATIONS
// ==========================================
adminRouter.get('/admin/realisations', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM realisations ORDER BY date DESC, display_order ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/realisations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM realisations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Réalisation non trouvée.' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/admin/realisations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    slug,
    edition,
    description,
    full_description,
    highlights,
    participants_count,
    zones,
    cover_image,
    status,
    date,
    published,
    display_order,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'Le titre est obligatoire.' });
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO realisations
       (title, slug, edition, description, full_description, highlights, participants_count, zones, cover_image, status, date, published, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        title,
        finalSlug,
        edition || 'Édition 2026',
        description || '',
        full_description || '',
        highlights || [],
        participants_count || 1,
        zones || [],
        cover_image || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        status || 'termine',
        date || new Date().toISOString().split('T')[0],
        published !== false,
        display_order || 0,
      ]
    );

    await logActivity(req.adminUser?.userId, 'create', 'realisation', result.rows[0].id, { title });
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/realisations/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    title,
    slug,
    edition,
    description,
    full_description,
    highlights,
    participants_count,
    zones,
    cover_image,
    status,
    date,
    published,
    display_order,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE realisations SET
         title = COALESCE($1, title),
         slug = COALESCE($2, slug),
         edition = COALESCE($3, edition),
         description = COALESCE($4, description),
         full_description = COALESCE($5, full_description),
         highlights = COALESCE($6, highlights),
         participants_count = COALESCE($7, participants_count),
         zones = COALESCE($8, zones),
         cover_image = COALESCE($9, cover_image),
         status = COALESCE($10, status),
         date = COALESCE($11, date),
         published = COALESCE($12, published),
         display_order = COALESCE($13, display_order),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        title,
        slug,
        edition,
        description,
        full_description,
        highlights,
        participants_count,
        zones,
        cover_image,
        status,
        date,
        published,
        display_order,
        id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Réalisation introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'realisation', id, { title });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/admin/realisations/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT title FROM realisations WHERE id = $1', [id]);
    await pool.query('DELETE FROM realisations WHERE id = $1', [id]);
    await logActivity(req.adminUser?.userId, 'delete', 'realisation', id, { title: existing.rows[0]?.title });
    res.json({ success: true, message: 'Réalisation supprimée.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CIRCUITS
// ==========================================
adminRouter.get('/admin/circuits', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM circuits ORDER BY display_order ASC, title ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/circuits/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM circuits WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Circuit non trouvé.' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/admin/circuits', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    slug,
    region,
    city,
    description,
    full_description,
    duration,
    highlights,
    cover_image,
    gallery,
    display_order,
    published,
  } = req.body;

  if (!title || !city) return res.status(400).json({ error: 'Titre et ville requis.' });
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO circuits
       (title, slug, region, city, description, full_description, duration, highlights, cover_image, gallery, display_order, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title,
        finalSlug,
        region || 'sud',
        city,
        description || '',
        full_description || '',
        duration || '1 journée',
        highlights || [],
        cover_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        gallery || [],
        display_order || 0,
        published !== false,
      ]
    );

    await logActivity(req.adminUser?.userId, 'create', 'circuit', result.rows[0].id, { title });
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/circuits/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    title,
    slug,
    region,
    city,
    description,
    full_description,
    duration,
    highlights,
    cover_image,
    gallery,
    display_order,
    published,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE circuits SET
         title = COALESCE($1, title),
         slug = COALESCE($2, slug),
         region = COALESCE($3, region),
         city = COALESCE($4, city),
         description = COALESCE($5, description),
         full_description = COALESCE($6, full_description),
         duration = COALESCE($7, duration),
         highlights = COALESCE($8, highlights),
         cover_image = COALESCE($9, cover_image),
         gallery = COALESCE($10, gallery),
         display_order = COALESCE($11, display_order),
         published = COALESCE($12, published),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        title,
        slug,
        region,
        city,
        description,
        full_description,
        duration,
        highlights,
        cover_image,
        gallery,
        display_order,
        published,
        id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Circuit introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'circuit', id, { title });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/admin/circuits/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT title FROM circuits WHERE id = $1', [id]);
    await pool.query('DELETE FROM circuits WHERE id = $1', [id]);
    await logActivity(req.adminUser?.userId, 'delete', 'circuit', id, { title: existing.rows[0]?.title });
    res.json({ success: true, message: 'Circuit supprimé.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PROGRAMME — SEMAINES
// ==========================================
adminRouter.get('/admin/program-weeks', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM program_weeks ORDER BY week_number ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/program-weeks/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { week_number, title, description, highlights, display_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE program_weeks SET
         week_number = COALESCE($1, week_number),
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         highlights = COALESCE($4, highlights),
         display_order = COALESCE($5, display_order),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [week_number, title, description, highlights, display_order, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Semaine introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'program_week', id, { title });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. PILIERS DU PROGRAMME
// ==========================================
adminRouter.get('/admin/pilars', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM pilars ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/pilars/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, image_url, display_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pilars SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         image_url = COALESCE($3, image_url),
         display_order = COALESCE($4, display_order),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, description, image_url, display_order, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pilier introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'pilar', id, { title });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. TÉMOIGNAGES
// ==========================================
adminRouter.get('/admin/testimonials', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY display_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/admin/testimonials', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { author_name, author_role, content, photo_url, edition, display_order, is_published } = req.body;
  if (!author_name || !content) return res.status(400).json({ error: 'Auteur et contenu requis.' });

  try {
    const result = await pool.query(
      `INSERT INTO testimonials (author_name, author_role, content, photo_url, edition, display_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [author_name, author_role || '', content, photo_url || null, edition || 'Édition 2025', display_order || 0, is_published !== false]
    );
    await logActivity(req.adminUser?.userId, 'create', 'testimonial', result.rows[0].id, { author_name });
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/testimonials/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { author_name, author_role, content, photo_url, edition, display_order, is_published } = req.body;

  try {
    const result = await pool.query(
      `UPDATE testimonials SET
         author_name = COALESCE($1, author_name),
         author_role = COALESCE($2, author_role),
         content = COALESCE($3, content),
         photo_url = COALESCE($4, photo_url),
         edition = COALESCE($5, edition),
         display_order = COALESCE($6, display_order),
         is_published = COALESCE($7, is_published)
       WHERE id = $8
       RETURNING *`,
      [author_name, author_role, content, photo_url, edition, display_order, is_published, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Témoignage introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'testimonial', id, { author_name });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/admin/testimonials/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
    await logActivity(req.adminUser?.userId, 'delete', 'testimonial', id);
    res.json({ success: true, message: 'Témoignage supprimé.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. PARTENAIRES
// ==========================================
adminRouter.get('/admin/partners', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM partners ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/admin/partners', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { name, logo_url, website_url, description, partner_type, display_order, is_published } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom du partenaire est requis.' });

  try {
    const result = await pool.query(
      `INSERT INTO partners (name, logo_url, website_url, description, partner_type, display_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, logo_url || null, website_url || null, description || '', partner_type || 'Partenaire', display_order || 0, is_published !== false]
    );
    await logActivity(req.adminUser?.userId, 'create', 'partner', result.rows[0].id, { name });
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/partners/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, logo_url, website_url, description, partner_type, display_order, is_published } = req.body;

  try {
    const result = await pool.query(
      `UPDATE partners SET
         name = COALESCE($1, name),
         logo_url = COALESCE($2, logo_url),
         website_url = COALESCE($3, website_url),
         description = COALESCE($4, description),
         partner_type = COALESCE($5, partner_type),
         display_order = COALESCE($6, display_order),
         is_published = COALESCE($7, is_published)
       WHERE id = $8
       RETURNING *`,
      [name, logo_url, website_url, description, partner_type, display_order, is_published, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Partenaire introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'partner', id, { name });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/admin/partners/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM partners WHERE id = $1', [id]);
    await logActivity(req.adminUser?.userId, 'delete', 'partner', id);
    res.json({ success: true, message: 'Partenaire supprimé.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. STATISTIQUES (CHIFFRES CLÉS)
// ==========================================
adminRouter.get('/admin/stats', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM stats ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/stats/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { label, value, suffix, display_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE stats SET
         label = COALESCE($1, label),
         value = COALESCE($2, value),
         suffix = COALESCE($3, suffix),
         display_order = COALESCE($4, display_order)
       WHERE id = $5
       RETURNING *`,
      [label, value, suffix, display_order, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Chiffre clé introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'stat', id, { label, value });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. INSCRIPTIONS
// ==========================================
adminRouter.get('/admin/inscriptions', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM inscriptions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/inscriptions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM inscriptions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Inscription non trouvée.' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/inscriptions/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, internal_note } = req.body;

  try {
    const result = await pool.query(
      `UPDATE inscriptions SET
         status = COALESCE($1, status),
         internal_note = COALESCE($2, internal_note),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, internal_note, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Inscription non trouvée.' });
    await logActivity(req.adminUser?.userId, 'update_status', 'inscription', id, { status });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV des inscriptions
adminRouter.get('/admin/inscriptions/export', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT first_name, last_name, email, phone, country, age, status, motivation, created_at FROM inscriptions ORDER BY created_at DESC');
    let csv = 'Prénom,Nom,Email,Téléphone,Pays,Âge,Statut,Date,Motivation\n';
    result.rows.forEach((row) => {
      const line = [
        `"${row.first_name || ''}"`,
        `"${row.last_name || ''}"`,
        `"${row.email || ''}"`,
        `"${row.phone || ''}"`,
        `"${row.country || ''}"`,
        row.age || '',
        `"${row.status || ''}"`,
        `"${new Date(row.created_at).toISOString().split('T')[0]}"`,
        `"${(row.motivation || '').replace(/"/g, '""')}"`,
      ].join(',');
      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inscriptions-pont-des-deux-rives.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. MESSAGES DE CONTACT
// ==========================================
adminRouter.get('/admin/contact-messages', requireAuth, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/contact-messages/:id', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message non trouvé.' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/contact-messages/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, internal_note } = req.body;

  try {
    const result = await pool.query(
      `UPDATE contact_messages SET
         status = COALESCE($1, status),
         internal_note = COALESCE($2, internal_note)
       WHERE id = $3
       RETURNING *`,
      [status, internal_note, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Message non trouvé.' });
    await logActivity(req.adminUser?.userId, 'update_status', 'contact_message', id, { status });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/contact-messages/export', requireAuth, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT name, email, phone, country, subject, status, message, created_at FROM contact_messages ORDER BY created_at DESC');
    let csv = 'Nom,Email,Téléphone,Pays,Objet,Statut,Date,Message\n';
    result.rows.forEach((row) => {
      const line = [
        `"${row.name || ''}"`,
        `"${row.email || ''}"`,
        `"${row.phone || ''}"`,
        `"${row.country || ''}"`,
        `"${row.subject || ''}"`,
        `"${row.status || ''}"`,
        `"${new Date(row.created_at).toISOString().split('T')[0]}"`,
        `"${(row.message || '').replace(/"/g, '""')}"`,
      ].join(',');
      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="messages-contact.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. NEWSLETTER
// ==========================================
adminRouter.get('/admin/newsletter', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/newsletter/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE newsletter_subscribers SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Abonné introuvable.' });
    await logActivity(req.adminUser?.userId, 'toggle_subscriber', 'newsletter', id, { is_active });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/newsletter/export', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT email, name, is_active, created_at FROM newsletter_subscribers ORDER BY created_at DESC');
    let csv = 'Email,Nom,Actif,Date Inscription\n';
    result.rows.forEach((row) => {
      csv += `"${row.email}","${row.name || ''}",${row.is_active ? 'Oui' : 'Non'},"${new Date(row.created_at).toISOString().split('T')[0]}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. GESTION DES UTILISATEURS (ADMIN UNIQUEMENT)
// ==========================================
adminRouter.get('/admin/users', requireAuth, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, is_active, created_at, last_login FROM admin_users ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/admin/users', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, name, role, is_active, created_at`,
      [email.trim().toLowerCase(), passwordHash, name.trim(), role || 'editeur']
    );

    await logActivity(req.adminUser?.userId, 'create', 'user', result.rows[0].id, { email });
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/users/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, role, is_active, newPassword } = req.body;

  try {
    let passwordHash: string | undefined;
    if (newPassword && newPassword.length >= 8) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const result = await pool.query(
      `UPDATE admin_users SET
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         is_active = COALESCE($3, is_active),
         password_hash = COALESCE($4, password_hash),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, role, is_active, updated_at`,
      [name, role, is_active, passwordHash, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    await logActivity(req.adminUser?.userId, 'update', 'user', id, { name, role });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/admin/users/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.adminUser?.userId) {
    return res.status(400).json({ error: 'Impossible de supprimer son propre compte administrateur.' });
  }

  try {
    await pool.query('DELETE FROM admin_users WHERE id = $1', [id]);
    await logActivity(req.adminUser?.userId, 'delete', 'user', id);
    res.json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 14. PARAMÈTRES DU SITE
// ==========================================
// Endpoint public
adminRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settingsMap: Record<string, string> = {};
    result.rows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });
    res.json(settingsMap);
  } catch {
    res.json({});
  }
});

adminRouter.get('/admin/settings', requireAuth, requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM settings ORDER BY key ASC');
    const map: Record<string, string> = {};
    result.rows.forEach((r) => {
      map[r.key] = r.value;
    });
    res.json(map);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/admin/settings', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const settingsObj = req.body; // { key: value, ... }

  try {
    for (const [key, value] of Object.entries(settingsObj)) {
      await pool.query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }

    await logActivity(req.adminUser?.userId, 'update', 'settings', undefined, { updatedKeys: Object.keys(settingsObj) });
    res.json({ success: true, message: 'Paramètres mis à jour.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 15. MÉDIATHÈQUE & UPLOAD
// ==========================================
adminRouter.get('/admin/media', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name as uploader_name
      FROM media_library m
      LEFT JOIN admin_users u ON m.uploaded_by = u.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/admin/media/upload', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni.' });
  }

  try {
    const saved = await saveFile(req.file);

    const dbRes = await pool.query(
      `INSERT INTO media_library (filename, original_name, mime_type, size_bytes, url, thumbnail_url, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        saved.filename,
        saved.originalName,
        saved.mimeType,
        saved.sizeBytes,
        saved.url,
        saved.thumbnailUrl || null,
        req.adminUser?.userId || null,
      ]
    );

    await logActivity(req.adminUser?.userId, 'upload', 'media', dbRes.rows[0].id, { filename: saved.filename });
    res.status(201).json(dbRes.rows[0]);
  } catch (err: any) {
    console.error('[Upload] Erreur :', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du fichier.' });
  }
});

adminRouter.delete('/admin/media/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM media_library WHERE id = $1', [id]);
    await logActivity(req.adminUser?.userId, 'delete', 'media', id);
    res.json({ success: true, message: 'Fichier retiré de la médiathèque.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 16. JOURNAL D'ACTIVITÉ
// ==========================================
adminRouter.get('/admin/activity', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as admin_name, u.email as admin_email
      FROM activity_log a
      LEFT JOIN admin_users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
