import path from 'path';
import fs from 'fs';
import multer from 'multer';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'cuentas');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const cuotaId = (req.params as { cuotaId?: string }).cuotaId || 'cuota';
    const ext = path.extname(file.originalname || '') || '.bin';
    const safeName = (path.basename(file.originalname || 'file', ext) || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${cuotaId}-${Date.now()}-${safeName}${ext}`);
  },
});

export const uploadComprobante = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname || '')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten PDF o imágenes'));
    }
  },
}).single('comprobante');
