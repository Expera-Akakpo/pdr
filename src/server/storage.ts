import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UploadedFileMeta {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
}

/**
 * ============================================================
 * SERVICE DE STOCKAGE DE MÉDIAS — PONT DES DEUX RIVES
 * ============================================================
 * Actuellement configuré pour le stockage sur le disque local
 * dans le répertoire public (/public/uploads/).
 *
 * Pour basculer vers un service tiers (ex. Cloudinary, AWS S3, Supabase Storage) :
 * 1. Remplacez le corps de la fonction `saveFile` ci-dessous avec
 *    votre appel SDK (ex. s3.upload() ou cloudinary.uploader.upload()).
 * 2. Retournez l'objet `UploadedFileMeta` avec l'URL publique distante.
 * ============================================================
 */
export async function saveFile(
  file: Express.Multer.File
): Promise<UploadedFileMeta> {
  const uploadsDir = path.resolve(__dirname, '../../public/uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Nom de fichier unique et sécurisé
  const extension = path.extname(file.originalname).toLowerCase();
  const safeBaseName = path
    .basename(file.originalname, extension)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 40);
  const uniqueFilename = `${Date.now()}_${safeBaseName}${extension}`;
  const targetPath = path.join(uploadsDir, uniqueFilename);

  // Écriture du fichier sur disque
  fs.writeFileSync(targetPath, file.buffer);

  const publicUrl = `/uploads/${uniqueFilename}`;

  return {
    filename: uniqueFilename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    url: publicUrl,
    thumbnailUrl: file.mimetype.startsWith('image/') ? publicUrl : undefined,
  };
}
