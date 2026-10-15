/**
 * Configuration de la console d'administration
 * Le segment d'URL secret est configuré via VITE_ADMIN_PATH dans .env
 */
export const ADMIN_SEGMENT = import.meta.env.VITE_ADMIN_PATH || 'console-6f3a9b2c';
export const ADMIN_BASE_PATH = `/${ADMIN_SEGMENT}`;
