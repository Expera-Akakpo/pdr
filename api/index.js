var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/server/db.ts
var db_exports = {};
__export(db_exports, {
  checkDbConnection: () => checkDbConnection,
  isDbConnected: () => isDbConnected,
  pool: () => pool
});
import pg from "pg";
import dotenv from "dotenv";
async function checkDbConnection() {
  if (!cleanConnectionString) {
    isConnected = false;
    return false;
  }
  try {
    await pool.query("SELECT 1");
    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    console.warn("[Neon PostgreSQL] \xC9chec du test de connexion :", err.message);
    return false;
  }
}
function isDbConnected() {
  return isConnected;
}
var rawUrl, cleanConnectionString, pool, isConnected;
var init_db = __esm({
  "src/server/db.ts"() {
    dotenv.config();
    rawUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
    if (!rawUrl) {
      console.warn("[Neon PostgreSQL] ATTENTION: La variable d'environnement DATABASE_URL n'est pas d\xE9finie.");
    }
    cleanConnectionString = rawUrl ? rawUrl.replace(/([?&])channel_binding=[^&]+(&|$)/, "$1").replace(/[?&]$/, "") : "";
    pool = new pg.Pool({
      connectionString: cleanConnectionString || void 0,
      ssl: cleanConnectionString ? {
        rejectUnauthorized: false
      } : void 0,
      max: 5,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 15e3
      // 15 secondes pour laisser à Neon le temps de sortir de veille
    });
    pool.on("error", (err) => {
      console.warn("[Neon Pool Warning] D\xE9connexion ou r\xE9initialisation d'un socket inactif :", err.message);
    });
    isConnected = false;
  }
});

// src/server/apiServer.ts
import express from "express";
import cookieParser from "cookie-parser";
import dotenv2 from "dotenv";

// src/server/mainApi.ts
init_db();
import { Router as Router2 } from "express";

// src/server/adminRoutes.ts
init_db();
import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";

// src/server/auth.ts
init_db();
import jwt from "jsonwebtoken";
var rawSecret = process.env.SECRET_KEY || process.env.JWT_SECRET || process.env.APP_SECRET || "";
var JWT_SECRET = rawSecret.trim().replace(/^["']|["']$/g, "");
function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("Variable d'environnement SECRET_KEY (ou JWT_SECRET) manquante.");
  }
  return JWT_SECRET;
}
function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "8h" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}
var loginAttempts = {};
function checkLoginRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1e3;
  const maxAttempts = 5;
  const record = loginAttempts[ip];
  if (!record) {
    loginAttempts[ip] = { count: 1, firstAttempt: now };
    return { allowed: true, remainingMs: 0 };
  }
  if (now - record.firstAttempt > windowMs) {
    loginAttempts[ip] = { count: 1, firstAttempt: now };
    return { allowed: true, remainingMs: 0 };
  }
  if (record.count >= maxAttempts) {
    const remainingMs = windowMs - (now - record.firstAttempt);
    return { allowed: false, remainingMs };
  }
  record.count += 1;
  return { allowed: true, remainingMs: 0 };
}
function resetLoginRateLimit(ip) {
  delete loginAttempts[ip];
}
async function requireAuth(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }
  if (!token && req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }
  if (!token) {
    return res.status(401).json({ error: "Acc\xE8s non autoris\xE9. Session inexistante ou expir\xE9e." });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Jeton de session invalide ou expir\xE9." });
  }
  try {
    const userRes = await pool.query("SELECT id, email, name, role, is_active FROM admin_users WHERE id = $1", [payload.userId]);
    if (userRes.rows.length > 0) {
      if (!userRes.rows[0].is_active) {
        return res.status(403).json({ error: "Ce compte utilisateur a \xE9t\xE9 d\xE9sactiv\xE9." });
      }
      req.adminUser = {
        userId: userRes.rows[0].id,
        email: userRes.rows[0].email,
        name: userRes.rows[0].name,
        role: userRes.rows[0].role
      };
    } else {
      req.adminUser = payload;
    }
    next();
  } catch (err) {
    req.adminUser = payload;
    next();
  }
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: "Authentification requise." });
    }
    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: "Permissions insuffisantes pour cette action." });
    }
    next();
  };
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function logActivity(adminId, action, entity, entityId, details) {
  try {
    const validAdminId = adminId && UUID_REGEX.test(adminId) ? adminId : null;
    const validEntityId = entityId && UUID_REGEX.test(entityId) ? entityId : null;
    await pool.query(
      `INSERT INTO activity_log (admin_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [validAdminId, action, entity, validEntityId, details ? JSON.stringify(details) : "{}"]
    );
  } catch (err) {
    console.warn("[Activity Log] \xC9chec de consignation s\xE9curis\xE9e :", err.message);
  }
}

// src/server/storage.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function saveFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const safeBaseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
  const uniqueFilename = `${Date.now()}_${safeBaseName}${extension}`;
  try {
    const uploadsDir = path.resolve(__dirname, "../../public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const targetPath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(targetPath, file.buffer);
    const publicUrl = `/uploads/${uniqueFilename}`;
    return {
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: publicUrl,
      thumbnailUrl: file.mimetype.startsWith("image/") ? publicUrl : void 0
    };
  } catch (err) {
    console.warn("[Storage] Disque en lecture seule ou erreur FS, utilisation de data URL base64 :", err.message);
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    return {
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: base64Data,
      thumbnailUrl: file.mimetype.startsWith("image/") ? base64Data : void 0
    };
  }
}

// src/server/adminRoutes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
  // 50MB
});
var adminRouter = Router();
adminRouter.post("/auth/login", async (req, res) => {
  const forwardedFor = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const ip = forwardedFor || req.ip || req.socket.remoteAddress || "unknown";
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil(rateLimit.remainingMs / 6e4);
    return res.status(429).json({
      error: `Trop de tentatives infructueuses. Veuillez patienter ${minutes} minute(s).`
    });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Identifiant (email ou nom d'utilisateur) et mot de passe requis." });
  }
  const submittedIdentifier = String(email || "").trim().toLowerCase();
  const submittedPassword = String(password || "");
  console.log(`[Admin Login] [Routage] Tentative de connexion re\xE7ue pour identifiant: "${submittedIdentifier}" | IP: ${ip}`);
  const rawAdminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_INITIAL_EMAIL || "";
  const rawAdminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || "";
  const envAdminEmail = rawAdminEmail.trim().replace(/^["']|["']$/g, "").toLowerCase();
  const envAdminPassword = rawAdminPassword.trim().replace(/^["']|["']$/g, "");
  if (envAdminEmail && envAdminPassword) {
    const isPasswordMatch = submittedPassword === envAdminPassword;
    const isEnvAdminMatch = submittedIdentifier === envAdminEmail || (submittedIdentifier === "admin" || submittedIdentifier === "administrateur") && envAdminEmail.startsWith("admin") || submittedIdentifier === envAdminEmail.split("@")[0];
    if (isEnvAdminMatch && isPasswordMatch) {
      console.log("[Admin Login] [Succ\xE8s] Authentification valid\xE9e via variables d'environnement.");
      resetLoginRateLimit(ip);
      let userId = "580b7225-f554-40d4-b9a2-1790d4609368";
      let name = "Administrateur ProGen B\xE9nin";
      const role = "admin";
      try {
        const existingUser = await pool.query("SELECT id, name FROM admin_users WHERE LOWER(email) = LOWER($1)", [envAdminEmail]);
        if (existingUser.rows.length > 0) {
          userId = existingUser.rows[0].id;
          name = existingUser.rows[0].name || name;
          await pool.query("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
        }
      } catch (dbSyncErr) {
        console.warn("[Admin Login] [PostgreSQL Note] Synchronisation DB optionnelle non bloquante :", dbSyncErr?.message);
      }
      let token;
      try {
        token = signToken({
          userId,
          email: envAdminEmail,
          name,
          role
        });
      } catch (tokenErr) {
        console.error("[Admin Login] [Erreur Initialisation JWT] SECRET_KEY manquant :", tokenErr.message);
        return res.status(500).json({
          error: "Configuration de s\xE9curit\xE9 incompl\xE8te : la variable d'environnement SECRET_KEY est requise sur le serveur."
        });
      }
      const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1e3
        // 8h
      });
      await logActivity(userId, "login", "auth", userId, { email: envAdminEmail, source: "env" });
      return res.json({
        success: true,
        message: "Connexion r\xE9ussie",
        token,
        user: {
          id: userId,
          email: envAdminEmail,
          name,
          role
        }
      });
    }
  }
  try {
    console.log("[Admin Login] [PostgreSQL] Ex\xE9cution de la requ\xEAte de v\xE9rification utilisateur...");
    const userRes = await pool.query(
      `SELECT id, email, password_hash, name, role, is_active 
       FROM admin_users 
       WHERE LOWER(email) = LOWER($1)
          OR (LOWER($1) IN ('admin', 'administrateur') AND role = 'admin')
          OR (SPLIT_PART(LOWER(email), '@', 1) = LOWER($1))
       ORDER BY last_login DESC NULLS LAST
       LIMIT 1`,
      [submittedIdentifier]
    );
    if (userRes.rows.length === 0) {
      console.log("[Admin Login] [\xC9chec Identifiant] Aucun compte correspondant trouv\xE9.");
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
    }
    const user = userRes.rows[0];
    if (!user.is_active) {
      console.log(`[Admin Login] [Compte Inactif] Compte utilisateur ${user.id} d\xE9sactiv\xE9.`);
      return res.status(403).json({ error: "Ce compte administrateur a \xE9t\xE9 d\xE9sactiv\xE9." });
    }
    if (!user.password_hash) {
      console.log(`[Admin Login] [Configuration Incompl\xE8te] Aucun hash de mot de passe pour ${user.id}.`);
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
    }
    console.log("[Admin Login] [V\xE9rification Bcrypt] Comparaison du hash de mot de passe...");
    const isMatch = await bcrypt.compare(submittedPassword, user.password_hash);
    if (!isMatch) {
      console.log("[Admin Login] [\xC9chec Mot de Passe] Mot de passe non concordant.");
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
    }
    console.log("[Admin Login] [Succ\xE8s] Mot de passe valid\xE9 avec succ\xE8s dans PostgreSQL.");
    resetLoginRateLimit(ip);
    try {
      await pool.query("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
    } catch (e) {
      console.warn("[Admin Login] [PostgreSQL Note] Impossible d'enregistrer last_login :", e.message);
    }
    let token;
    try {
      token = signToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (tokenErr) {
      console.error("[Admin Login] [Erreur Initialisation JWT] SECRET_KEY manquant :", tokenErr.message);
      return res.status(500).json({
        error: "Configuration de s\xE9curit\xE9 incompl\xE8te : la variable d'environnement SECRET_KEY est requise sur le serveur."
      });
    }
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1e3
      // 8h
    });
    await logActivity(user.id, "login", "auth", user.id, { email: user.email });
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    const isConnectionError = err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT" || err.message?.includes("timeout") || err.message?.includes("connection") || err.message?.includes("DATABASE_URL");
    if (isConnectionError) {
      console.error("[Admin Login] [\xC9chec Connexion PostgreSQL] Impossible de joindre la base de donn\xE9es :", err.message);
    } else {
      console.error("[Admin Login] [\xC9chec Requ\xEAte SQL] Erreur lors de l'ex\xE9cution SQL :", err.message);
    }
    return res.status(500).json({
      error: "Erreur technique de connexion \xE0 la base de donn\xE9es. Veuillez r\xE9essayer dans quelques instants."
    });
  }
});
adminRouter.post("/auth/logout", requireAuth, async (req, res) => {
  res.clearCookie("admin_token");
  if (req.adminUser) {
    await logActivity(req.adminUser.userId, "logout", "auth", req.adminUser.userId);
  }
  res.json({ success: true, message: "D\xE9connexion effectu\xE9e." });
});
adminRouter.get("/auth/me", requireAuth, (req, res) => {
  res.json({
    user: req.adminUser
  });
});
adminRouter.post("/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau mot de passe requis." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit comporter au moins 8 caract\xE8res." });
  }
  try {
    const userRes = await pool.query("SELECT password_hash FROM admin_users WHERE id = $1", [req.adminUser?.userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect." });
    }
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [newHash, req.adminUser?.userId]);
    await logActivity(req.adminUser?.userId, "change_password", "auth", req.adminUser?.userId);
    res.json({ success: true, message: "Mot de passe modifi\xE9 avec succ\xE8s." });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du changement de mot de passe." });
  }
});
adminRouter.get("/admin/dashboard", requireAuth, async (_req, res) => {
  try {
    const [realisationsCount, circuitsCount, inscriptionsCount, messagesCount, newsletterCount, recentLogs] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM realisations"),
      pool.query("SELECT COUNT(*) FROM circuits"),
      pool.query("SELECT COUNT(*) FROM inscriptions WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM contact_messages WHERE status = 'nouveau'"),
      pool.query("SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true"),
      pool.query(`
        SELECT a.id, a.action, a.entity, a.details, a.created_at, u.name as admin_name
        FROM activity_log a
        LEFT JOIN admin_users u ON a.admin_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 10
      `)
    ]);
    res.json({
      counts: {
        realisations: parseInt(realisationsCount.rows[0]?.count || "0", 10),
        circuits: parseInt(circuitsCount.rows[0]?.count || "0", 10),
        newInscriptions7d: parseInt(inscriptionsCount.rows[0]?.count || "0", 10),
        unreadMessages: parseInt(messagesCount.rows[0]?.count || "0", 10),
        activeSubscribers: parseInt(newsletterCount.rows[0]?.count || "0", 10)
      },
      recentActivities: recentLogs.rows
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des indicateurs du tableau de bord." });
  }
});
adminRouter.get("/admin/realisations", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM realisations ORDER BY date DESC, display_order ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/realisations/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM realisations WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "R\xE9alisation non trouv\xE9e." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.post("/admin/realisations", requireAuth, async (req, res) => {
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
    display_order
  } = req.body;
  if (!title) return res.status(400).json({ error: "Le titre est obligatoire." });
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  try {
    const result = await pool.query(
      `INSERT INTO realisations
       (title, slug, edition, description, full_description, highlights, participants_count, zones, cover_image, status, date, published, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        title,
        finalSlug,
        edition || "\xC9dition 2026",
        description || "",
        full_description || "",
        highlights || [],
        participants_count || 1,
        zones || [],
        cover_image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
        status || "termine",
        date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        published !== false,
        display_order || 0
      ]
    );
    await logActivity(req.adminUser?.userId, "create", "realisation", result.rows[0].id, { title });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/realisations/:id", requireAuth, async (req, res) => {
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
    display_order
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
        id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "R\xE9alisation introuvable." });
    await logActivity(req.adminUser?.userId, "update", "realisation", id, { title });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.delete("/admin/realisations/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query("SELECT title FROM realisations WHERE id = $1", [id]);
    await pool.query("DELETE FROM realisations WHERE id = $1", [id]);
    await logActivity(req.adminUser?.userId, "delete", "realisation", id, { title: existing.rows[0]?.title });
    res.json({ success: true, message: "R\xE9alisation supprim\xE9e." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/circuits", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM circuits ORDER BY display_order ASC, title ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/circuits/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM circuits WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Circuit non trouv\xE9." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.post("/admin/circuits", requireAuth, async (req, res) => {
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
    published
  } = req.body;
  if (!title || !city) return res.status(400).json({ error: "Titre et ville requis." });
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  try {
    const result = await pool.query(
      `INSERT INTO circuits
       (title, slug, region, city, description, full_description, duration, highlights, cover_image, gallery, display_order, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title,
        finalSlug,
        region || "sud",
        city,
        description || "",
        full_description || "",
        duration || "1 journ\xE9e",
        highlights || [],
        cover_image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        gallery || [],
        display_order || 0,
        published !== false
      ]
    );
    await logActivity(req.adminUser?.userId, "create", "circuit", result.rows[0].id, { title });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/circuits/:id", requireAuth, async (req, res) => {
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
    published
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
        id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Circuit introuvable." });
    await logActivity(req.adminUser?.userId, "update", "circuit", id, { title });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.delete("/admin/circuits/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query("SELECT title FROM circuits WHERE id = $1", [id]);
    await pool.query("DELETE FROM circuits WHERE id = $1", [id]);
    await logActivity(req.adminUser?.userId, "delete", "circuit", id, { title: existing.rows[0]?.title });
    res.json({ success: true, message: "Circuit supprim\xE9." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/program-weeks", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM program_weeks ORDER BY week_number ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/program-weeks/:id", requireAuth, async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Semaine introuvable." });
    await logActivity(req.adminUser?.userId, "update", "program_week", id, { title });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/pilars", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pilars ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/pilars/:id", requireAuth, async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Pilier introuvable." });
    await logActivity(req.adminUser?.userId, "update", "pilar", id, { title });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/testimonials", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM testimonials ORDER BY display_order ASC, created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.post("/admin/testimonials", requireAuth, async (req, res) => {
  const { author_name, author_role, content, photo_url, edition, display_order, is_published } = req.body;
  if (!author_name || !content) return res.status(400).json({ error: "Auteur et contenu requis." });
  try {
    const result = await pool.query(
      `INSERT INTO testimonials (author_name, author_role, content, photo_url, edition, display_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [author_name, author_role || "", content, photo_url || null, edition || "\xC9dition 2025", display_order || 0, is_published !== false]
    );
    await logActivity(req.adminUser?.userId, "create", "testimonial", result.rows[0].id, { author_name });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/testimonials/:id", requireAuth, async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "T\xE9moignage introuvable." });
    await logActivity(req.adminUser?.userId, "update", "testimonial", id, { author_name });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.delete("/admin/testimonials/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM testimonials WHERE id = $1", [id]);
    await logActivity(req.adminUser?.userId, "delete", "testimonial", id);
    res.json({ success: true, message: "T\xE9moignage supprim\xE9." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/partners", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM partners ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.post("/admin/partners", requireAuth, async (req, res) => {
  const { name, logo_url, website_url, description, partner_type, display_order, is_published } = req.body;
  if (!name) return res.status(400).json({ error: "Le nom du partenaire est requis." });
  try {
    const result = await pool.query(
      `INSERT INTO partners (name, logo_url, website_url, description, partner_type, display_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, logo_url || null, website_url || null, description || "", partner_type || "Partenaire", display_order || 0, is_published !== false]
    );
    await logActivity(req.adminUser?.userId, "create", "partner", result.rows[0].id, { name });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/partners/:id", requireAuth, async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Partenaire introuvable." });
    await logActivity(req.adminUser?.userId, "update", "partner", id, { name });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.delete("/admin/partners/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM partners WHERE id = $1", [id]);
    await logActivity(req.adminUser?.userId, "delete", "partner", id);
    res.json({ success: true, message: "Partenaire supprim\xE9." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/stats", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stats ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/stats/:id", requireAuth, async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Chiffre cl\xE9 introuvable." });
    await logActivity(req.adminUser?.userId, "update", "stat", id, { label, value });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/inscriptions", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inscriptions ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/inscriptions/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inscriptions WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Inscription non trouv\xE9e." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/inscriptions/:id", requireAuth, async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Inscription non trouv\xE9e." });
    await logActivity(req.adminUser?.userId, "update_status", "inscription", id, { status });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/inscriptions/export", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT first_name, last_name, email, phone, country, age, status, motivation, created_at FROM inscriptions ORDER BY created_at DESC");
    let csv = "Pr\xE9nom,Nom,Email,T\xE9l\xE9phone,Pays,\xC2ge,Statut,Date,Motivation\n";
    result.rows.forEach((row) => {
      const line = [
        `"${row.first_name || ""}"`,
        `"${row.last_name || ""}"`,
        `"${row.email || ""}"`,
        `"${row.phone || ""}"`,
        `"${row.country || ""}"`,
        row.age || "",
        `"${row.status || ""}"`,
        `"${new Date(row.created_at).toISOString().split("T")[0]}"`,
        `"${(row.motivation || "").replace(/"/g, '""')}"`
      ].join(",");
      csv += line + "\n";
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="inscriptions-pont-des-deux-rives.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/contact-messages", requireAuth, requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/contact-messages/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contact_messages WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Message non trouv\xE9." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/contact-messages/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Message non trouv\xE9." });
    await logActivity(req.adminUser?.userId, "update_status", "contact_message", id, { status });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/contact-messages/export", requireAuth, requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await pool.query("SELECT name, email, phone, country, subject, status, message, created_at FROM contact_messages ORDER BY created_at DESC");
    let csv = "Nom,Email,T\xE9l\xE9phone,Pays,Objet,Statut,Date,Message\n";
    result.rows.forEach((row) => {
      const line = [
        `"${row.name || ""}"`,
        `"${row.email || ""}"`,
        `"${row.phone || ""}"`,
        `"${row.country || ""}"`,
        `"${row.subject || ""}"`,
        `"${row.status || ""}"`,
        `"${new Date(row.created_at).toISOString().split("T")[0]}"`,
        `"${(row.message || "").replace(/"/g, '""')}"`
      ].join(",");
      csv += line + "\n";
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="messages-contact.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/newsletter", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/newsletter/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      "UPDATE newsletter_subscribers SET is_active = $1 WHERE id = $2 RETURNING *",
      [is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Abonn\xE9 introuvable." });
    await logActivity(req.adminUser?.userId, "toggle_subscriber", "newsletter", id, { is_active });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/newsletter/export", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query("SELECT email, name, is_active, created_at FROM newsletter_subscribers ORDER BY created_at DESC");
    let csv = "Email,Nom,Actif,Date Inscription\n";
    result.rows.forEach((row) => {
      csv += `"${row.email}","${row.name || ""}",${row.is_active ? "Oui" : "Non"},"${new Date(row.created_at).toISOString().split("T")[0]}"
`;
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="newsletter-subscribers.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/users", requireAuth, requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, email, name, role, is_active, created_at, last_login FROM admin_users ORDER BY created_at ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.post("/admin/users", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Nom, email et mot de passe requis." });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, name, role, is_active, created_at`,
      [email.trim().toLowerCase(), passwordHash, name.trim(), role || "editeur"]
    );
    await logActivity(req.adminUser?.userId, "create", "user", result.rows[0].id, { email });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/users/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, role, is_active, newPassword } = req.body;
  try {
    let passwordHash;
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
    if (result.rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable." });
    await logActivity(req.adminUser?.userId, "update", "user", id, { name, role });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.delete("/admin/users/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  if (id === req.adminUser?.userId) {
    return res.status(400).json({ error: "Impossible de supprimer son propre compte administrateur." });
  }
  try {
    await pool.query("DELETE FROM admin_users WHERE id = $1", [id]);
    await logActivity(req.adminUser?.userId, "delete", "user", id);
    res.json({ success: true, message: "Utilisateur supprim\xE9." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/settings", async (_req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM settings");
    const settingsMap = {};
    result.rows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });
    res.json(settingsMap);
  } catch {
    res.json({});
  }
});
adminRouter.get("/admin/settings", requireAuth, requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await pool.query("SELECT key, value, updated_at FROM settings ORDER BY key ASC");
    const map = {};
    result.rows.forEach((r) => {
      map[r.key] = r.value;
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.put("/admin/settings", requireAuth, requireRole(["admin"]), async (req, res) => {
  const settingsObj = req.body;
  try {
    for (const [key, value] of Object.entries(settingsObj)) {
      await pool.query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
    await logActivity(req.adminUser?.userId, "update", "settings", void 0, { updatedKeys: Object.keys(settingsObj) });
    res.json({ success: true, message: "Param\xE8tres mis \xE0 jour." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/media", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name as uploader_name
      FROM media_library m
      LEFT JOIN admin_users u ON m.uploaded_by = u.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.post("/admin/media/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
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
        req.adminUser?.userId || null
      ]
    );
    await logActivity(req.adminUser?.userId, "upload", "media", dbRes.rows[0].id, { filename: saved.filename });
    res.status(201).json(dbRes.rows[0]);
  } catch (err) {
    console.error("[Upload] Erreur :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du fichier." });
  }
});
adminRouter.delete("/admin/media/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM media_library WHERE id = $1", [id]);
    await logActivity(req.adminUser?.userId, "delete", "media", id);
    res.json({ success: true, message: "Fichier retir\xE9 de la m\xE9diath\xE8que." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
adminRouter.get("/admin/activity", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as admin_name, u.email as admin_email
      FROM activity_log a
      LEFT JOIN admin_users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// src/server/seedData.ts
var INITIAL_PILARS = [
  {
    id: "p1",
    slug: "activites-benevoles",
    title: "Activit\xE9s b\xE9n\xE9voles",
    description: "Mettez vos comp\xE9tences au service des communaut\xE9s b\xE9ninoises : \xE9ducation, sant\xE9, environnement, entrepreneuriat.",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    display_order: 1
  },
  {
    id: "p2",
    slug: "famille-accueil",
    title: "Famille d'accueil",
    description: "Vivez au rythme d'une famille b\xE9ninoise et d\xE9couvrez la culture de l'int\xE9rieur dans un cadre bienveillant.",
    image_url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80",
    display_order: 2
  },
  {
    id: "p3",
    slug: "circuit-touristique",
    title: "Circuit touristique",
    description: "Explorez les sites historiques et naturels majeurs du B\xE9nin, du sud au centre du pays.",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    display_order: 3
  }
];
var INITIAL_WEEKS = [
  {
    id: "w1",
    week_number: 1,
    title: "Semaine 1 \u2014 D\xE9couverte et int\xE9gration",
    description: "Accueil, immersion civique et d\xE9couverte des grands rep\xE8res historiques du Sud.",
    highlights: [
      "Formalit\xE9s administratives et accueil officiel \xE0 l'a\xE9roport par l'\xE9quipe ProGen B\xE9nin.",
      "D\xE9couverte des sites historiques et culturels de Bohicon : Palais Royal, site souterrain d'Agouinguinto et grand march\xE9 central.",
      "Initiation \xE0 la bonne citoyennet\xE9 : participation active \xE0 des ateliers communautaires (sant\xE9 sexuelle et reproductive, entrepreneuriat local).",
      "Rencontre et dialogue avec les acteurs de la soci\xE9t\xE9 civile : \xE9changes directs avec des membres d'ONG et d'associations locales."
    ],
    display_order: 1
  },
  {
    id: "w2",
    week_number: 2,
    title: "Semaine 2 \u2014 Immersion familiale et culturelle",
    description: "Partage du quotidien en famille b\xE9ninoise et d\xE9couverte des traditions locales de l'int\xE9rieur.",
    highlights: [
      "S\xE9jour complet en immersion dans une famille d'accueil b\xE9ninoise : pr\xE9paration des repas, t\xE2ches quotidiennes, agriculture et vie de quartier.",
      "Participation \xE0 des activit\xE9s sportives de proximit\xE9 et participation \xE0 des manifestations culturelles (concerts, festivals).",
      "Apprentissage de la langue fon : discussions interactives avec les enfants du quartier et visionnage de productions en langue fon."
    ],
    display_order: 2
  },
  {
    id: "w3",
    week_number: 3,
    title: "Semaine 3 \u2014 D\xE9couverte du patrimoine et engagement",
    description: "Voyage d'exploration du Sud patrimonial et participation concr\xE8te \xE0 un chantier communautaire.",
    highlights: [
      "Voyage d\xE9couverte du sud du B\xE9nin : Porto-Novo (capitale patrimoniale), Ouidah (Route des Esclaves, Porte du Non-Retour) et Grand-Popo (Possotom\xE9).",
      "Rencontre avec les artisans et entrepreneurs : poterie \xE0 Abomey, vannerie \xE0 Ganvi\xE9, tissage traditionnel \xE0 Djidja et sculpture sur bois \xE0 Saclo.",
      "Participation \xE0 un projet de d\xE9veloppement communautaire : sensibilisation aux questions d'hygi\xE8ne et appui aux infrastructures scolaires ou sanitaires."
    ],
    display_order: 3
  },
  {
    id: "w4",
    week_number: 4,
    title: "Semaine 4 \u2014 Bilan et citoyennet\xE9 active",
    description: "Bilan personnel, capitalisation des acquis et c\xE9l\xE9bration de la fraternit\xE9 interculturelle.",
    highlights: [
      "\xC9laboration d'un projet personnel de citoyennet\xE9 active pr\xE9sent\xE9 aux membres de la communaut\xE9.",
      "Bilan d'exp\xE9rience, entretiens individuels et pr\xE9paration du retour avec les encadrants.",
      "Organisation d'une soir\xE9e chaleureuse d'au revoir r\xE9unissant les familles d'accueil, amis et partenaires.",
      "Remise officielle du certificat de participation ProGen B\xE9nin attestant de l'implication dans le programme."
    ],
    display_order: 4
  }
];
var INITIAL_CIRCUITS = [
  {
    id: "c1",
    slug: "ganvie-cite-lacustre",
    title: "Ganvi\xE9 \u2014 La cit\xE9 lacustre",
    region: "sud",
    city: "Ganvi\xE9 (Lac Nokou\xE9)",
    description: "Un village enti\xE8rement construit sur pilotis sur le lac Nokou\xE9, o\xF9 toute la vie s'organise en pirogue : march\xE9s flottants, \xE9coles, habitations.",
    full_description: "Surnomm\xE9e avec fiert\xE9 la Venise de l'Afrique, Ganvi\xE9 est une prouesse humaine et patrimoniale b\xE2tie au XVIIe si\xE8cle par les populations Toffinou fuyant les razzias. La visite guid\xE9e en pirogue \xE0 perche permet de sillonner les canaux, d'observer les march\xE9s flottants matinaux, de d\xE9couvrir les syst\xE8mes ancestraux de parcs de branchages (acadjas) et de partager un \xE9change avec les habitants de l'eau.",
    duration: "1 journ\xE9e",
    highlights: ["March\xE9 flottant matinal", "Travers\xE9e en pirogue traditionnelle", "\xC9coles et cases sur pilotis", "Artisanat lacustre toffinou"],
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 1
  },
  {
    id: "c2",
    slug: "ouidah-route-des-esclaves",
    title: "Ouidah \u2014 La route des esclaves",
    region: "sud",
    city: "Ouidah",
    description: "Ville historique, haut lieu de m\xE9moire avec la Porte du Non-Retour, le Temple des Pythons, le mus\xE9e d'histoire et la basilique.",
    full_description: "Ouidah repr\xE9sente un carrefour m\xE9moriel et spirituel majeur d'Afrique. Le parcours emprunte la Route des Esclaves, jalonn\xE9e de m\xE9moriaux et de symboles, jusqu'\xE0 la majestueuse Porte du Non-Retour sur le rivage de l'Oc\xE9an Atlantique. Visite du Fort Portugais h\xE9bergeant le Mus\xE9e d'Histoire, de la Basilique de l'Immacul\xE9e Conception et d\xE9couverte du Temple des Pythons au c\u0153ur de la ville.",
    duration: "1 journ\xE9e",
    highlights: ["Porte du Non-Retour face \xE0 la mer", "Temple sacr\xE9 des Pythons", "Fort Portugais & Mus\xE9e d'Histoire", "For\xEAt sacr\xE9e de Kpass\xE8"],
    cover_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 2
  },
  {
    id: "c3",
    slug: "abomey-palais-royaux",
    title: "Abomey \u2014 Les Palais Royaux",
    region: "centre",
    city: "Abomey",
    description: "Ancienne capitale du royaume du Danhom\xE8, class\xE9e au patrimoine mondial de l'UNESCO. Ses palais royaux et ses bas-reliefs racontent l'histoire du B\xE9nin.",
    full_description: "Capitale guerri\xE8re du Danhom\xE8 fond\xE9e au XVIIe si\xE8cle, Abomey abrite les palais historiques de douze souverains successifs. Class\xE9 au patrimoine mondial de l'UNESCO, le site pr\xE9sente des bas-reliefs uniques en terre cuite polychrome illustrant les victoires militaires, les tr\xF4nes sculpt\xE9s mont\xE9s sur des cr\xE2nes d'ennemis, les tentures appliqu\xE9es d'apparat et les c\xE9l\xE8bres armes des r\xE9giments d'Amazones (Agoodji\xE9).",
    duration: "1 journ\xE9e",
    highlights: ["Palais Royaux class\xE9s UNESCO", "Bas-reliefs en terre cuite", "Mus\xE9e d'Histoire militaire et dynastique", "Ateliers de tentures d'Abomey"],
    cover_image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 3
  },
  {
    id: "c4",
    slug: "bohicon-marche-agouinguinto",
    title: "Bohicon \u2014 Le march\xE9 central et le site d'Agouinguinto",
    region: "centre",
    city: "Bohicon",
    description: "Un march\xE9 anim\xE9 et un site souterrain \xE9nigmatique \xE0 d\xE9couvrir en petit groupe.",
    full_description: "Bohicon est le poumon ferroviaire et commercial du Zou. D\xE9couverte de son march\xE9 central bourdonnant d'\xE9pices, de tissus et de produits mara\xEEchers. \xC0 quelques kilom\xE8tres, exploration du village souterrain d'Agouinguinto, complexe remarquable de refuges et galeries creus\xE9s au XVIe si\xE8cle pour se pr\xE9munir des attaques ennemies.",
    duration: "1/2 journ\xE9e",
    highlights: ["Site souterrain arch\xE9ologique d'Agouinguinto", "March\xE9 central de Bohicon", "Histoire d\xE9fensive pr\xE9coloniale"],
    cover_image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 4
  },
  {
    id: "c5",
    slug: "porto-novo-capitale-patrimoniale",
    title: "Porto-Novo \u2014 La capitale patrimoniale",
    region: "sud",
    city: "Porto-Novo",
    description: "Ancienne capitale coloniale, riche de son architecture afro-br\xE9silienne, de ses mus\xE9es et de son grand march\xE9.",
    full_description: "Porto-Novo, la cit\xE9 d'Adjatch\xE8 aux lagunes calmes, s\xE9duit par sa douceur et son histoire singuli\xE8re. Le circuit explore les fa\xE7ades aux frontons baroques h\xE9rit\xE9es des familles afro-br\xE9siliennes affranchies, l'\xE9tonnante Grande Mosqu\xE9e inspir\xE9e de l'\xE9glise de Salvador de Bahia, le Mus\xE9e Honm\xE8 (palais royal) et le Mus\xE9e Ethnographique.",
    duration: "1 journ\xE9e",
    highlights: ["Architecture baroque afro-br\xE9silienne", "Grande Mosqu\xE9e embl\xE9matique", "Mus\xE9e ethnographique Adand\xE9", "Jardin des Plantes et de la Nature"],
    cover_image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 5
  },
  {
    id: "c6",
    slug: "grand-popo-possotome",
    title: "Grand-Popo & Possotom\xE9 \u2014 Plages et nature",
    region: "sud",
    city: "Grand-Popo & Lac Ah\xE9m\xE9",
    description: "Plages de sable fin, embouchure du Mono, village de Possotom\xE9 connu pour son lac et ses paysages.",
    full_description: "Un s\xE9jour de ressourcement entre oc\xE9an et eau douce. \xC0 Grand-Popo, admirez la Bouche du Roy o\xF9 le fleuve Mono rejoint les vagues atlantiques. Puis cap sur Possotom\xE9 au bord du lac Ah\xE9m\xE9 pour un circuit \xE9cotouristique guid\xE9 \xE0 la d\xE9couverte des traditions rituelles, des plantes m\xE9dicinales et de la cuisine locale de poisson frais.",
    duration: "2 jours",
    highlights: ["Embouchure de la Bouche du Roy", "Plages calmes de Grand-Popo", "\xC9cotourisme sur le lac Ah\xE9m\xE9", "Nuit en campement \xE9cologique"],
    cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 6
  },
  {
    id: "c7",
    slug: "cotonou-ville-en-mouvement",
    title: "Cotonou \u2014 La ville en mouvement",
    region: "sud",
    city: "Cotonou",
    description: "D\xE9couverte de la place de l'Amazone, du march\xE9 Dantokpa, du port et des quartiers anim\xE9s de la capitale \xE9conomique.",
    full_description: "C\u0153ur \xE9conomique et cr\xE9atif du pays, Cotonou bouillonne d'\xE9nergie. Ce circuit urbain permet de contempler l'imposante statue en bronze de l'Amazone de 30 m\xE8tres, symbole de bravoure f\xE9minine, de longer le Boulevard de la Marina, d'arpenter les all\xE9es du mythique march\xE9 international Dantokpa et de visiter les fondations d'art contemporain.",
    duration: "1/2 journ\xE9e",
    highlights: ["Place et statue g\xE9ante de l'Amazone", "March\xE9 international Dantokpa", "Boulevard de la Marina", "Galeries artistiques urbaines"],
    cover_image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 7
  },
  {
    id: "c8",
    slug: "abomey-calavi-artisanat",
    title: "Abomey-Calavi \u2014 Artisanat et vie locale",
    region: "sud",
    city: "Abomey-Calavi",
    description: "Balade dans la ville universitaire, d\xE9couverte des ateliers d'artisans et des march\xE9s locaux.",
    full_description: "Abomey-Calavi, berceau du si\xE8ge de ProGen B\xE9nin, est une commune vibrante en bordure du lac Nokou\xE9. Visite du si\xE8ge de l'ONG, rencontre avec les artisans menuisiers et vanniers, promenade sur le campus universitaire d'Abomey-Calavi et d\xE9gustation des mets de rue r\xE9put\xE9s.",
    duration: "1/2 journ\xE9e",
    highlights: ["Si\xE8ge officiel ProGen B\xE9nin", "Ateliers d'artisans et menuisiers", "Campus Universitaire d'Abomey-Calavi", "Immersion dans les march\xE9s de quartier"],
    cover_image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 8
  },
  {
    id: "c9",
    slug: "djidja-saclo-savoir-faire",
    title: "Djidja & Saclo \u2014 Savoir-faire traditionnels",
    region: "centre",
    city: "Djidja & Saclo (Zou)",
    description: "Rencontre avec les tisserands de Djidja et les sculpteurs sur bois de Saclo.",
    full_description: "Une plong\xE9e intime dans les racines des arts manuels b\xE9ninois. \xC0 Djidja, \xE9change avec les tisseuses et tisserands utilisant des m\xE9tiers traditionnels en bois pour produire le pagne kanv\xF4. \xC0 Saclo, d\xE9couverte des ma\xEEtres sculpteurs sur bois d'Iroko fa\xE7onnant masques, statuettes et insignes de chefferie.",
    duration: "1 journ\xE9e",
    highlights: ["Tissage traditionnel du kanv\xF4", "Sculpture sur bois sacr\xE9 \xE0 Saclo", "Atelier pratique d'initiation", "\xC9change avec les ma\xEEtres artisans"],
    cover_image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 9
  },
  {
    id: "c10",
    slug: "za-kpota-immersion-communautaire",
    title: "Za-Kpota \u2014 Immersion communautaire",
    region: "centre",
    city: "Za-Kpota",
    description: "Visite d'\xE9coles rurales partenaires, rencontre avec les communaut\xE9s et participation \xE0 des activit\xE9s d'engagement.",
    full_description: "Le c\u0153ur social du programme Pont des Deux Rives. Les participants partagent une journ\xE9e compl\xE8te dans une communaut\xE9 rurale de Za-Kpota : lecture et animations avec les \xE9coliers, participation \xE0 la r\xE9novation d'une salle de classe ou \xE0 un atelier d'hygi\xE8ne dentaire, et temps d'\xE9change fraternel avec le comit\xE9 villageois.",
    duration: "1 journ\xE9e",
    highlights: ["Accueil festif par le village", "Atelier d'animation avec les \xE9coliers", "Contribution concr\xE8te au d\xE9veloppement rural", "Partage d'un repas champ\xEAtre"],
    cover_image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
    ],
    display_order: 10
  }
];
var INITIAL_REALISATIONS = [
  {
    id: "r1",
    slug: "premiere-edition-2025",
    title: "Premi\xE8re \xE9dition du programme \u2014 2025",
    edition: "\xC9dition 2025",
    date: "15 Janvier 2025",
    status: "termine",
    description: "La premi\xE8re \xE9dition du programme Pont des Deux Rives a accueilli une volontaire tunisienne pendant un mois d'immersion, de d\xE9couverte et d'engagement aux c\xF4t\xE9s des communaut\xE9s b\xE9ninoises.",
    full_description: "La toute premi\xE8re \xE9dition du programme Pont des Deux Rives a constitu\xE9 un succ\xE8s humain et formateur remarquable. H\xE9berg\xE9e pendant un mois au sein d'une famille d'accueil bienveillante \xE0 Abomey-Calavi, la participante a pleinement exp\xE9riment\xE9 le quotidien b\xE9ninois : confection des repas, apprentissage des salutations et expressions usuelles en langue fon, et partage de moments inoubliables avec les enfants du quartier.\n\nSur le terrain, la volontaire s'est investie avec enthousiasme dans l'animation d'ateliers de sensibilisation \xE0 la sant\xE9 sexuelle et reproductive ainsi qu'\xE0 l'hygi\xE8ne communautaire au profit de jeunes \xE9l\xE8ves. Le volet culturel a permis d'explorer les merveilles de Ganvi\xE9, la Route des Esclaves \xE0 Ouidah, les Palais Royaux d'Abomey et la capitale Porto-Novo.\n\nPour cl\xF4turer son s\xE9jour, elle a \xE9labor\xE9 et pr\xE9sent\xE9 avec brio son projet personnel de citoyennet\xE9 active, avant de recevoir son certificat officiel lors d'une soir\xE9e d'au revoir conviviale r\xE9unissant famille d'accueil et repr\xE9sentants associatifs.",
    highlights: [
      "Immersion compl\xE8te de 30 jours au sein d'une famille d'accueil bienveillante",
      "Participation active \xE0 des ateliers de sensibilisation en sant\xE9 publique et hygi\xE8ne",
      "Visites patrimoniales compl\xE8tes : Ganvi\xE9, Ouidah, Abomey et Porto-Novo",
      "\xC9laboration et restitution d'un projet personnel de citoyennet\xE9 active",
      "Remise officielle du certificat de participation ProGen B\xE9nin"
    ],
    participants_count: 1,
    zones: ["Abomey-Calavi", "Ganvi\xE9", "Ouidah", "Abomey", "Porto-Novo"],
    cover_image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80", caption: "Accueil chaleureux de la participante en famille d'accueil" },
      { url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80", caption: "Atelier \xE9ducatif communautaire avec les enfants" },
      { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", caption: "Travers\xE9e en pirogue lors de la d\xE9couverte de Ganvi\xE9" },
      { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", caption: "\xC9tape m\xE9morielle \xE0 la Porte du Non-Retour \xE0 Ouidah" },
      { url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", caption: "Visite guid\xE9e des Palais Royaux d'Abomey" },
      { url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=80", caption: "Soir\xE9e d'au revoir et remise du certificat officiel" }
    ]
  }
];
var INITIAL_TESTIMONIALS = [
  {
    id: "t1",
    author_name: "[T\xE9moignage \xE0 venir \u2014 participante de la premi\xE8re \xE9dition, 2025]",
    author_role: "Volontaire internationale (Tunisie)",
    edition: "\xC9dition 2025",
    content: "Ce mois pass\xE9 au B\xE9nin restera \xE0 jamais grav\xE9 dans mon parcours. Partager le quotidien de ma famille d'accueil, me rendre utile dans les \xE9coles et explorer des sites aussi charg\xE9s d'\xE9motion que Ganvi\xE9 ou Ouidah a compl\xE8tement enrichi mon engagement citoyen.",
    is_published: true
  },
  {
    id: "t2",
    author_name: "[T\xE9moignage \xE0 venir \u2014 famille d'accueil d'Abomey-Calavi]",
    author_role: "Famille d'accueil partenaire (Calavi)",
    edition: "\xC9dition 2025",
    content: "Accueillir notre premi\xE8re volontaire a \xE9t\xE9 une f\xEAte pour toute notre maisonn\xE9e. Nos enfants ont d\xE9couvert une nouvelle culture et nous avons partag\xE9 nos plats, notre langue et nos traditions avec fiert\xE9.",
    is_published: true
  },
  {
    id: "t3",
    author_name: "[T\xE9moignage \xE0 venir \u2014 \xE9quipe de coordination ProGen B\xE9nin]",
    author_role: "Coordination g\xE9n\xE9rale du projet",
    edition: "\xC9dition 2025",
    content: "Le Pont des Deux Rives incarne notre conviction : le volontourisme solidaire cr\xE9e de v\xE9ritables ponts fraternels entre les peuples. Les r\xE9sultats de cette premi\xE8re \xE9dition nous motivent \xE0 accueillir de nouvelles promotions.",
    is_published: true
  }
];
var INITIAL_PARTNERS = [
  { id: "part1", name: "ProGen B\xE9nin", partner_type: "ONG Porteuse", description: "Organisation non gouvernementale porteuse du projet." },
  { id: "part2", name: "US-BWAA", partner_type: "Partenaire international", description: "Coop\xE9ration internationale et d\xE9veloppement \xE9ducatif." },
  { id: "part3", name: "BeninviEducation", partner_type: "\xC9ducation", description: "R\xE9seau d'appui \xE0 la scolarisation et au parrainage d'enfants." },
  { id: "part4", name: "Magic r\xE9cr\xE9", partner_type: "Animation & Jeunesse", description: "Activit\xE9s ludiques et animations socioculturelles." },
  { id: "part5", name: "AppStates", partner_type: "Universitaire", description: "Partenariat acad\xE9mique et mobilit\xE9 des \xE9tudiants." },
  { id: "part6", name: "Collectivit\xE9s territoriales", partner_type: "Collectivit\xE9 locale", description: "Mairies et arrondissements d'accueil au B\xE9nin." }
];
var INITIAL_STATS = [
  { id: "s1", label: "Dur\xE9e du programme", value: "1", suffix: " mois (4 sem.)" },
  { id: "s2", label: "Public vis\xE9", value: "Diaspora", suffix: " & Volontaires" },
  { id: "s3", label: "Premi\xE8re vague", value: "15 D\xE9c - 15 Jan", suffix: "" },
  { id: "s4", label: "Partenaires engag\xE9s", value: "6", suffix: " organisations" }
];

// src/server/mainApi.ts
var mainApi = Router2();
var localInscriptions = [];
var localContactMessages = [];
mainApi.use(adminRouter);
mainApi.get("/health", async (_req, res) => {
  let dbOk = false;
  let dbError = null;
  try {
    const testRes = await pool.query("SELECT NOW() as current_time");
    dbOk = !!testRes.rows[0];
  } catch (err) {
    dbError = err.message;
  }
  res.json({
    status: "ok",
    neonConnected: dbOk || isDbConnected(),
    databaseStatus: dbOk ? "Neon PostgreSQL connect\xE9" : "Mode de secours m\xE9moire activ\xE9",
    error: dbError,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
mainApi.get("/programs", async (_req, res) => {
  try {
    const pilarsRes = await pool.query("SELECT * FROM pilars ORDER BY display_order ASC");
    const weeksRes = await pool.query("SELECT * FROM program_weeks ORDER BY display_order ASC");
    if (pilarsRes.rows.length > 0 && weeksRes.rows.length > 0) {
      return res.json({
        pilars: pilarsRes.rows,
        weeks: weeksRes.rows
      });
    }
  } catch (err) {
  }
  res.json({
    pilars: INITIAL_PILARS,
    weeks: INITIAL_WEEKS
  });
});
mainApi.get("/circuits", async (req, res) => {
  const { region } = req.query;
  try {
    let query = "SELECT * FROM circuits WHERE (published IS NULL OR published = true)";
    const params = [];
    if (region && typeof region === "string" && ["sud", "centre", "nord"].includes(region)) {
      query += " AND region = $1";
      params.push(region);
    }
    query += " ORDER BY display_order ASC, title ASC";
    const circuitsRes = await pool.query(query, params);
    if (circuitsRes.rows.length > 0) {
      return res.json(circuitsRes.rows);
    }
  } catch (err) {
  }
  let filtered = INITIAL_CIRCUITS;
  if (region && typeof region === "string") {
    filtered = filtered.filter((c) => c.region === region);
  }
  res.json(filtered);
});
mainApi.get("/circuits/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const circuitRes = await pool.query("SELECT * FROM circuits WHERE slug = $1", [slug]);
    if (circuitRes.rows.length > 0) {
      return res.json(circuitRes.rows[0]);
    }
  } catch (err) {
  }
  const found = INITIAL_CIRCUITS.find((c) => c.slug === slug);
  if (found) {
    return res.json(found);
  }
  res.status(404).json({ error: "Circuit non trouv\xE9" });
});
mainApi.get("/realisations", async (_req, res) => {
  try {
    const realisationsRes = await pool.query("SELECT * FROM realisations WHERE (published IS NULL OR published = true) ORDER BY date DESC, display_order ASC");
    if (realisationsRes.rows.length > 0) {
      return res.json(realisationsRes.rows);
    }
  } catch (err) {
  }
  res.json(INITIAL_REALISATIONS);
});
mainApi.get("/testimonials", async (_req, res) => {
  try {
    const testRes = await pool.query("SELECT * FROM testimonials WHERE is_published = true ORDER BY display_order ASC");
    if (testRes.rows.length > 0) {
      return res.json(testRes.rows);
    }
  } catch (err) {
  }
  res.json(INITIAL_TESTIMONIALS);
});
mainApi.get("/stats", async (_req, res) => {
  try {
    const statsRes = await pool.query("SELECT * FROM stats ORDER BY display_order ASC");
    if (statsRes.rows.length > 0) {
      return res.json(statsRes.rows);
    }
  } catch (err) {
  }
  res.json(INITIAL_STATS);
});
mainApi.get("/partners", async (_req, res) => {
  try {
    const partRes = await pool.query("SELECT * FROM partners WHERE (is_published IS NULL OR is_published = true) ORDER BY display_order ASC");
    if (partRes.rows.length > 0) {
      return res.json(partRes.rows);
    }
  } catch (err) {
  }
  res.json(INITIAL_PARTNERS);
});
mainApi.post("/inscriptions", async (req, res) => {
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
    return res.status(400).json({ error: "Les champs pr\xE9nom, nom et e-mail sont obligatoires." });
  }
  const record = {
    id: "insc_" + Date.now(),
    first_name,
    last_name,
    email,
    phone: phone || "",
    country: country || "B\xE9nin",
    age: age ? Number(age) : null,
    motivation: motivation || "",
    consent_contact: consent_contact !== false,
    status: "nouveau",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const dbRes = await pool.query(
      `INSERT INTO inscriptions (first_name, last_name, email, phone, country, age, motivation, consent_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [first_name, last_name, email, phone || null, country || "Non pr\xE9cis\xE9", age ? Number(age) : null, motivation || null, consent_contact !== false]
    );
    if (dbRes.rows[0]) {
      record.id = dbRes.rows[0].id;
    }
  } catch (err) {
    console.warn("[API Inscriptions] Sauvegarde locale :", err.message);
  }
  localInscriptions.push(record);
  res.status(201).json({
    success: true,
    message: "Votre demande d'inscription a \xE9t\xE9 enregistr\xE9e avec succ\xE8s. Un membre de l'\xE9quipe ProGen B\xE9nin vous contactera sous 48 h.",
    inscription: record
  });
});
mainApi.post("/contact", async (req, res) => {
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
    return res.status(400).json({ error: "Les champs nom, e-mail et message sont obligatoires." });
  }
  const record = {
    id: "msg_" + Date.now(),
    name,
    email,
    phone: phone || "",
    country: country || "",
    subject: subject || "Demande d'information g\xE9n\xE9rale",
    message,
    newsletter_optin: !!newsletter_optin,
    status: "nouveau",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const dbRes = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, country, subject, message, newsletter_optin)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [name, email, phone || null, country || null, subject || "Information", message, !!newsletter_optin]
    );
    if (dbRes.rows[0]) {
      record.id = dbRes.rows[0].id;
    }
  } catch (err) {
    console.warn("[API Contact] Sauvegarde locale :", err.message);
  }
  localContactMessages.push(record);
  res.status(201).json({
    success: true,
    message: "Merci pour votre message. L'\xE9quipe ProGen B\xE9nin vous r\xE9pondra sous 48 h ouvr\xE9es.",
    data: record
  });
});

// src/server/apiServer.ts
dotenv2.config();
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use((req, _res, next) => {
  const forwardedUri = req.headers["x-forwarded-uri"] || req.headers["x-matched-path"] || req.headers["x-invoke-path"];
  if (forwardedUri && forwardedUri.startsWith("/api") && (req.url === "/" || req.url === "/api" || req.url === "/api/")) {
    req.url = forwardedUri;
  }
  console.log(`[Vercel Serverless] ${req.method} ${req.url} (Forwarded: ${forwardedUri || "none"})`);
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
process.on("uncaughtException", (err) => {
  console.error("[Vercel Serverless UncaughtException]:", err?.message || err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Vercel Serverless UnhandledRejection]:", reason?.message || reason);
});
console.log("[Vercel Serverless] Initialisation du handler Vercel Express API");
app.get(["/api/health", "/health"], async (_req, res) => {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasSecret = !!(process.env.SECRET_KEY || process.env.JWT_SECRET || process.env.APP_SECRET);
  const hasAdminEmail = !!(process.env.ADMIN_EMAIL || process.env.ADMIN_INITIAL_EMAIL);
  const hasAdminPassword = !!(process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD);
  let dbOk = false;
  let dbError = null;
  if (hasDbUrl) {
    try {
      const { pool: pool2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const test = await pool2.query("SELECT 1 as test");
      dbOk = !!test.rows[0];
    } catch (e) {
      dbError = e?.message || "Erreur DB";
    }
  }
  res.json({
    status: "ok",
    environmentConfigured: {
      DATABASE_URL: hasDbUrl,
      SECRET_KEY: hasSecret,
      ADMIN_EMAIL: hasAdminEmail,
      ADMIN_PASSWORD: hasAdminPassword,
      NODE_ENV: process.env.NODE_ENV || "production",
      nodeVersion: process.version
    },
    databaseConnected: dbOk,
    databaseError: dbError,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api", mainApi);
app.use("/", mainApi);
app.use((err, req, res, _next) => {
  console.error(`[Vercel Serverless Error] Sur ${req.method} ${req.url} :`, err?.message || err);
  res.status(500).json({
    error: "Une erreur technique interne est survenue sur le serveur.",
    details: process.env.NODE_ENV === "production" ? void 0 : err?.message
  });
});
var apiServer_default = app;
export {
  apiServer_default as default
};
