/**
 * Configuration de la console d'administration
 * Accessible simplement via le hashtag #admin_pdr (ex: https://monsite.com/#admin_pdr)
 * ou directement via la route /admin_pdr (aucune variable d'environnement requise)
 */
export const ADMIN_SEGMENT =
  (import.meta.env.ADMIN_PATH as string) ||
  (import.meta.env.VITE_ADMIN_PATH as string) ||
  'admin_pdr';
export const ADMIN_BASE_PATH = `/${ADMIN_SEGMENT}`;
