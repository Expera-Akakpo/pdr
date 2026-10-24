import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from './db.ts';

const JWT_SECRET =
  process.env.SECRET_KEY ||
  process.env.JWT_SECRET ||
  process.env.APP_SECRET ||
  'f8a9e6d4c2b1a03e7f5d9c8b2a1e0f3d7c5b9a8e2f1d0c4b6a8e9f2d1c3b5a7e';

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): AdminAuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminAuthPayload;
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

// Helper to log activities in database
export async function logActivity(adminId: string | undefined, action: string, entity: string, entityId?: string, details?: any) {
  try {
    await pool.query(
      `INSERT INTO activity_log (admin_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId || null, action, entity, entityId || null, details ? JSON.stringify(details) : '{}']
    );
  } catch (err: any) {
    console.warn('[Activity Log] Échec de consignation :', err.message);
  }
}
