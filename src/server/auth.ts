import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from './db';

const rawSecret =
  process.env.SECRET_KEY ||
  process.env.JWT_SECRET ||
  process.env.APP_SECRET ||
  '';

const JWT_SECRET = rawSecret.trim().replace(/^["']|["']$/g, '');

export function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('Variable d\'environnement SECRET_KEY (ou JWT_SECRET) manquante.');
  }
  return JWT_SECRET;
}

export interface AdminAuthPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editeur';
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminAuthPayload;
}

export function signToken(payload: AdminAuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
}

export function verifyToken(token: string): AdminAuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AdminAuthPayload;
  } catch {
    return null;
  }
}

// Simple in-memory rate limiter for login
const loginAttempts: Record<string, { count: number; firstAttempt: number }> = {};

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
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

export function resetLoginRateLimit(ip: string) {
  delete loginAttempts[ip];
}

// Authentication middleware for admin routes
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Check cookies
  if (!token && (req as any).cookies && (req as any).cookies.admin_token) {
    token = (req as any).cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé. Session inexistante ou expirée.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Jeton de session invalide ou expiré.' });
  }

  // Verify in database that user is active
  try {
    const userRes = await pool.query('SELECT id, email, name, role, is_active FROM admin_users WHERE id = $1', [payload.userId]);
    if (userRes.rows.length > 0) {
      if (!userRes.rows[0].is_active) {
        return res.status(403).json({ error: 'Ce compte utilisateur a été désactivé.' });
      }
      req.adminUser = {
        userId: userRes.rows[0].id,
        email: userRes.rows[0].email,
        name: userRes.rows[0].name,
        role: userRes.rows[0].role,
      };
    } else {
      req.adminUser = payload;
    }
    next();
  } catch (err: any) {
    // If DB check fails, rely on valid JWT payload
    req.adminUser = payload;
    next();
  }
}

// Role authorization middleware
export function requireRole(allowedRoles: ('admin' | 'editeur')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }
    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes pour cette action.' });
    }
    next();
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper to log activities in database safely
export async function logActivity(adminId: string | undefined, action: string, entity: string, entityId?: string, details?: any) {
  try {
    const validAdminId = adminId && UUID_REGEX.test(adminId) ? adminId : null;
    const validEntityId = entityId && UUID_REGEX.test(entityId) ? entityId : null;
    await pool.query(
      `INSERT INTO activity_log (admin_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [validAdminId, action, entity, validEntityId, details ? JSON.stringify(details) : '{}']
    );
  } catch (err: any) {
    console.warn('[Activity Log] Échec de consignation sécurisée :', err.message);
  }
}
