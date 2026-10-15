import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './src/server/db.ts';

dotenv.config();

async function seedAdmin() {
  const email = process.env.ADMIN_INITIAL_EMAIL || 'admin@progenbenin.org';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'ProGenAdmin2026!';
  const name = 'Administrateur ProGen Bénin';
  const role = 'admin';

  try {
    console.log(`[Seed Admin] Préparation du compte administrateur : ${email}...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO admin_users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, name, role;
    `;

    const res = await pool.query(query, [email, passwordHash, name, role]);
    console.log('[Seed Admin] Compte administrateur configuré avec succès :');
    console.log(' - ID :', res.rows[0].id);
    console.log(' - Email :', res.rows[0].email);
    console.log(' - Nom :', res.rows[0].name);
    console.log(' - Rôle :', res.rows[0].role);
    console.log(' - Mot de passe temporaire :', password);
    console.log(' IMPORTANT : Veuillez modifier ce mot de passe dès votre première connexion dans la console.');
    process.exit(0);
  } catch (err: any) {
    console.error('[Seed Admin] Erreur lors de la création du compte :', err.message);
    process.exit(1);
  }
}

seedAdmin();
