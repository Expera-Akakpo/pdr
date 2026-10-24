import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================
 * CONNEXION NEON POSTGRESQL — PONT DES DEUX RIVES
 * ============================================================
 */
const rawUrl = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');

if (!rawUrl) {
  console.warn('[Neon PostgreSQL] ATTENTION: La variable d\'environnement DATABASE_URL n\'est pas définie.');
}

// Nettoyer le paramètre channel_binding s'il est présent pour compatibilité avec le pilote pg Node
const cleanConnectionString = rawUrl
  ? rawUrl.replace(/([?&])channel_binding=[^&]+(&|$)/, '$1').replace(/[?&]$/, '')
  : '';

export const pool = new pg.Pool({
  connectionString: cleanConnectionString || undefined,
  ssl: cleanConnectionString
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // 15 secondes pour laisser à Neon le temps de sortir de veille
});

// Écouteur obligatoire pour empêcher Node.js de crasher sur déconnexion idle en serverless
pool.on('error', (err) => {
  console.warn('[Neon Pool Warning] Déconnexion ou réinitialisation d\'un socket inactif :', err.message);
});

let isConnected = false;

export async function checkDbConnection(): Promise<boolean> {
  if (!cleanConnectionString) {
    isConnected = false;
    return false;
  }
  try {
    await pool.query('SELECT 1');
    isConnected = true;
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn('[Neon PostgreSQL] Échec du test de connexion :', err.message);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
