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

// Standalone iframe embed player page (Apenas o vídeo)
app.get('/embed/:id', (req, res) => {
  const videoId = req.params.id;
  // Fallback to sample or uploaded video
  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VeloTurb Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .player-wrap { position: relative; width: 100%; height: 100%; }
    video { width: 100%; height: 100%; object-fit: contain; }
    .unmute-banner {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      background: #FACC15; color: #000; font-family: system-ui, sans-serif;
      font-weight: 700; font-size: 13px; padding: 10px 22px; border-radius: 9999px;
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5); z-index: 50; white-space: nowrap;
      animation: pulseBanner 2s infinite;
    }
    @keyframes pulseBanner {
      0%, 100% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.04); }
    }
    .progress-bar { position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: rgba(255,255,255,0.2); z-index: 30; }
    .progress-fill { height: 100%; width: 0%; background: #E11D48; transition: width 0.15s linear; }
  </style>
</head>
<body>
  <div class="player-wrap">
    <div id="unmute" class="unmute-banner">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
      <span>Seu vídeo já começou! Clique para ouvir áudio 🔊</span>
    </div>
    <video id="v" src="${sampleVideoUrl}" autoplay muted playsinline webkit-playsinline oncontextmenu="return false;"></video>
    <div class="progress-bar"><div id="fill" class="progress-fill"></div></div>
  </div>
  <script>
    (function() {
      var v = document.getElementById('v');
      var btn = document.getElementById('unmute');
      var fill = document.getElementById('fill');
      function unmuteAndRestart() {
        v.currentTime = 0;
        v.muted = false;
        v.volume = 1;
        v.play();
        if (btn) btn.style.display = 'none';
      }
      if (btn) btn.onclick = function(e) { e.stopPropagation(); unmuteAndRestart(); };
      v.onclick = function() { if (v.muted || (btn && btn.style.display !== 'none')) unmuteAndRestart(); };
      v.addEventListener('timeupdate', function() {
        if (fill && v.duration) {
          var pct = (v.currentTime / v.duration) * 100;
          fill.style.width = Math.min(100, Math.pow(pct / 100, 0.55) * 100) + '%';
        }
      });
      v.play().catch(function() { v.muted = true; v.play(); });
    })();
  </script>
</body>
</html>`);
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
