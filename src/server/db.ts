import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================
 * CONNEXION NEON POSTGRESQL — PONT DES DEUX RIVES
 * ============================================================
 * L'URL de connexion Neon est configurée via la variable d'environnement
 * DATABASE_URL dans le fichier .env
 *
 * Pour modifier ou remplacer la base de données :
 * 1. Ouvrez le fichier .env
 * 2. Modifiez la valeur de DATABASE_URL=...
 * 3. Ou collez directement votre chaîne ci-dessous dans la valeur par défaut.
 * ============================================================
 */
const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_FaHr4SwJdk9V@ep-dark-king-b48wa814-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const connectionString = process.env.DATABASE_URL || DEFAULT_NEON_URL;

export const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test et statut de connexion
let isConnected = false;

pool.query('SELECT 1')
  .then(() => {
    isConnected = true;
    console.log('[Neon PostgreSQL] Connecté avec succès à la base Neon.');
  })
  .catch((err) => {
    console.warn('[Neon PostgreSQL] Avertissement connexion Neon :', err.message);
    console.warn('[Neon PostgreSQL] Mode hybride activé avec données initiales sécurisées.');
  });

export function isDbConnected(): boolean {
  return isConnected;
}
