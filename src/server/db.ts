import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================
 * CONNEXION NEON POSTGRESQL — PONT DES DEUX RIVES
 * ============================================================
 */
const DEFAULT_NEON_URL =
  'postgresql://neondb_owner:npg_FaHr4SwJdk9V@ep-dark-king-b48wa814-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Nettoyage de la chaîne de connexion (guillemets accidentels copiés dans Vercel UI)
const rawUrl = (process.env.DATABASE_URL || DEFAULT_NEON_URL).trim().replace(/^["']|["']$/g, '');

// Nettoyer le paramètre channel_binding s'il est présent pour compatibilité totale du pilote en serverless
const cleanConnectionString = rawUrl.replace(/([?&])channel_binding=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

export const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // 15 secondes pour laisser à Neon le temps de sortir de veille
});

// Écouteur obligatoire pour empêcher Node.js de crasher sur déconnexion idle en serverless
pool.on('error', (err) => {
  console.warn('[Neon Pool Warning] Déconnexion ou réinitialisation d\'un socket inactif :', err.message);
});

// Statut de connexion informatif
let isConnected = false;

pool
  .query('SELECT 1')
  .then(() => {
    isConnected = true;
    console.log('[Neon PostgreSQL] Connecté avec succès à la base Neon.');
  })
  .catch((err) => {
    console.warn('[Neon PostgreSQL] Vérification initiale de la base Neon :', err.message);
    console.warn('[Neon PostgreSQL] Mode hybride activé avec données initiales sécurisées.');
  });

export function isDbConnected(): boolean {
  return isConnected;
}
