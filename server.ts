import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 800, // 800 MB limit
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded videos with HTTP 206 Partial Content support for fast seeking
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Endpoint for uploading videos
app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/videos/${req.file.filename}`;

    return res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/videos/${req.file.filename}`,
      absoluteUrl: fileUrl,
    });
  } catch (error) {
    console.error('Erro no upload de vídeo:', error);
    return res.status(500).json({ error: 'Erro interno durante upload do vídeo.' });
  }
});

// Endpoint to list local hosted videos
app.get('/api/videos', (_req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const videoFiles = files
      .filter((file) => /\.(mp4|webm|mov|m4v)$/i.test(file))
      .map((file) => {
        const stats = fs.statSync(path.join(uploadsDir, file));
        return {
          filename: file,
          url: `/uploads/videos/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      });
    return res.json({ videos: videoFiles });
  } catch (err) {
    return res.json({ videos: [] });
  }
});

// Development vs Production setup
if (process.env.NODE_ENV !== 'production') {
  // In development, mount Vite dev server as middleware
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // In production, serve static built files
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`VeloTurb Server rodando na porta ${PORT}`);
});
