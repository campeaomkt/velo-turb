import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { detectAndNormalizeVideoUrl, DEFAULT_BUNNY_CDN_HOSTNAME } from './src/utils/urlDetector.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Diretórios de dados e uploads
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, 'public', 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Arquivo de configuração persistente
const configFile = path.join(dataDir, 'config.json');
let appConfig = {
  bunnyCdnHostname: process.env.BUNNY_CDN_HOSTNAME || DEFAULT_BUNNY_CDN_HOSTNAME,
};

if (fs.existsSync(configFile)) {
  try {
    appConfig = { ...appConfig, ...JSON.parse(fs.readFileSync(configFile, 'utf-8')) };
  } catch (e) {
    console.warn('[VeloTurb Server] Falha ao ler config.json, usando padrão:', e);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(configFile, JSON.stringify(appConfig, null, 2));
  } catch (e) {
    console.error('[VeloTurb Server] Erro ao salvar config.json:', e);
  }
}

// Banco de dados JSON de vídeos persistente
const videosDbFile = path.join(dataDir, 'videos_db.json');
let videosDb: Record<string, any> = {};

// Vídeos padrão pré-carregados (para teste imediato)
const SEED_VIDEOS = [
  {
    id: 'vt_vsl_dedilhados',
    title: 'MINI VSL DEDILHADOS E ARPEJOS LATAM - 15-04-26.mov',
    description: 'Mini VSL de alta conversão para teclado e arranjos.',
    folderId: 'all',
    videoUrl: 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/playlist.m3u8',
    videoType: 'hls',
    bunnyLibraryId: '802485',
    bunnyVideoId: 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7',
    bunnyCdnHostname: 'vz-de50afce-82d.b-cdn.net',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    duration: 537,
    plays: 0,
    views: 0,
    playRate: 0,
    pitchTime: 500,
    retentionAtPitch: 0,
    createdAt: '07/11/2026',
    settings: {
      primaryColor: '#0066FF',
      smartAutoplay: true,
      smartAutoplayText: 'Seu vídeo já começou! Clique para ouvir áudio 🔊',
      smartAutoplayTheme: 'yellow',
      fakeProgressBar: true,
      fakeProgressSpeed: 'fast',
      onlyProgressBar: true,
      hideControls: false,
      allowPause: true,
      resumePlayback: true,
      speedControl: true,
      antiDownload: true,
      domainLock: '*',
      pitchDelaySeconds: 500,
      pulsingCta: true,
      ctaText: 'QUERO TER SOM PROFISSIONAL',
      ctaSubtext: 'Acesso imediato • Sons do Nord Stage • Compatível com celular',
      ctaUrl: 'https://seusite.com.br/checkout',
      showWatermark: false,
      thumbSniper: {
        enabled: true,
        type: 'template',
        templateId: 'ts_01',
      },
    },
  },
  {
    id: 'vt_vsl_aevo_pro',
    title: 'AEVO PRO BR - Pack Audio Evolution',
    description: 'Vídeo oficial Bunny Stream Library 802485 (537 segundos)',
    folderId: 'fld_pasta_teste',
    videoUrl: 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/playlist.m3u8',
    videoType: 'hls',
    bunnyVideoId: 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7',
    bunnyLibraryId: '802485',
    bunnyCdnHostname: 'vz-de50afce-82d.b-cdn.net',
    thumbnailUrl: 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/thumbnail.jpg',
    duration: 537,
    plays: 12890,
    views: 16400,
    playRate: 78.5,
    pitchTime: 500,
    retentionAtPitch: 71.4,
    createdAt: '07/11/2026',
    settings: {
      primaryColor: '#0066FF',
      smartAutoplay: true,
      smartAutoplayText: 'Seu vídeo já começou! Clique para ouvir áudio 🔊',
      smartAutoplayTheme: 'yellow',
      fakeProgressBar: true,
      fakeProgressSpeed: 'fast',
      onlyProgressBar: true,
      hideControls: false,
      allowPause: true,
      resumePlayback: true,
      speedControl: true,
      antiDownload: true,
      domainLock: '*',
      pitchDelaySeconds: 500,
      pulsingCta: true,
      ctaText: 'QUERO TER SOM PROFISSIONAL',
      ctaSubtext: 'Acesso imediato • Sons do Nord Stage • Compatível com celular',
      ctaUrl: 'https://seusite.com.br/checkout',
      showWatermark: false,
      thumbSniper: {
        enabled: true,
        type: 'template',
        templateId: 'ts_01',
      },
    },
  },
];

if (fs.existsSync(videosDbFile)) {
  try {
    videosDb = JSON.parse(fs.readFileSync(videosDbFile, 'utf-8'));
  } catch (e) {
    console.warn('[VeloTurb Server] Inicializando banco de vídeos novo.');
    videosDb = {};
  }
}

// Inicializa vídeos semente se banco estiver vazio
SEED_VIDEOS.forEach((vid) => {
  if (!videosDb[vid.id]) {
    videosDb[vid.id] = vid;
  }
});

function saveVideosDb() {
  try {
    fs.writeFileSync(videosDbFile, JSON.stringify(videosDb, null, 2));
  } catch (e) {
    console.error('[VeloTurb Server] Erro ao salvar banco de vídeos:', e);
  }
}
saveVideosDb();

// Multer storage para upload local
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
    fileSize: 1024 * 1024 * 800, // 800 MB
  },
});

// CORS completo para qualquer página externa (WordPress, Elementor, HTML estático, Live Server 127.0.0.1:5500)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTA 1: Servir player.js standalone com CORS total
const servePlayerJs = (_req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  const playerJsPath = path.join(__dirname, 'public', 'player.js');
  if (fs.existsSync(playerJsPath)) {
    return res.sendFile(playerJsPath);
  }
  return res.send(`/* VeloTurb SmartPlayer */ console.log('[VeloTurb] Player carregado.');`);
};

app.get('/player.js', servePlayerJs);
app.get('/uploads/player.js', servePlayerJs);

// ROTA 2: Obter configuração do Bunny CDN Hostname
app.get('/api/config', (_req, res) => {
  return res.json(appConfig);
});

// ROTA 3: Salvar configuração do Bunny CDN Hostname
app.post('/api/config', (req, res) => {
  const { bunnyCdnHostname } = req.body;
  if (bunnyCdnHostname && typeof bunnyCdnHostname === 'string') {
    appConfig.bunnyCdnHostname = bunnyCdnHostname.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    saveConfig();
  }
  return res.json({ success: true, config: appConfig });
});

// ROTA 4: GET /api/videos/:id (Usada pelo player.js na página de vendas)
app.get('/api/videos/:id', (req, res) => {
  const videoId = req.params.id;
  const video = videosDb[videoId];

  if (!video) {
    return res.status(404).json({ error: 'Vídeo não encontrado', id: videoId });
  }

  const type = video.videoType || (video.videoUrl?.includes('.m3u8') ? 'hls' : 'mp4');

  return res.json({
    id: video.id,
    type,
    src: video.videoUrl,
    poster: video.thumbnailUrl,
    pitchDelay: video.settings?.pitchDelaySeconds || video.pitchTime || 0,
    pitchDelaySeconds: video.settings?.pitchDelaySeconds || video.pitchTime || 0,
    primaryColor: video.settings?.primaryColor || '#E11D48',
    title: video.title,
    name: video.title,
    smartAutoplay: video.settings?.smartAutoplay ?? true,
    smartAutoplayText: video.settings?.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio',
    smartAutoplayTheme: video.settings?.smartAutoplayTheme || 'yellow',
    onlyProgressBar: video.settings?.onlyProgressBar ?? true,
    thumbSniper: video.settings?.thumbSniper || { enabled: true, templateId: 'ts_01' },
    settings: video.settings,
  });
});

// ROTA 5: POST /api/videos (Cadastrar ou converter URL de VSL)
app.post('/api/videos', (req, res) => {
  try {
    const {
      url,
      rawUrl,
      title,
      folderId,
      pitchDelaySeconds,
      ctaText,
      ctaUrl,
      customCdnHostname,
      settings: customSettings,
    } = req.body;

    const targetUrl = (rawUrl || url || '').trim();
    const effectiveHost = customCdnHostname || appConfig.bunnyCdnHostname;

    const normalized = detectAndNormalizeVideoUrl(targetUrl, effectiveHost);

    if (!normalized.isValid) {
      return res.status(400).json({ error: normalized.error || 'URL inválida.' });
    }

    const newId = `vt_vsl_${Math.random().toString(36).substring(2, 9)}`;
    const pitch = parseInt(pitchDelaySeconds || '15', 10);

    const newVideo = {
      id: newId,
      title: (title || 'Minha VSL de Vendas').trim(),
      folderId: folderId || 'fld_vsl_core',
      videoUrl: normalized.src,
      videoType: normalized.type,
      bunnyVideoId: normalized.videoId,
      bunnyLibraryId: normalized.libraryId,
      bunnyCdnHostname: normalized.cdnHostname || effectiveHost,
      thumbnailUrl: normalized.poster,
      duration: 540,
      plays: 0,
      views: 0,
      playRate: 100,
      pitchTime: pitch,
      retentionAtPitch: 65.0,
      createdAt: new Date().toISOString().split('T')[0],
      settings: {
        primaryColor: customSettings?.primaryColor || '#E11D48',
        smartAutoplay: customSettings?.smartAutoplay ?? true,
        smartAutoplayText: customSettings?.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio',
        smartAutoplayTheme: customSettings?.smartAutoplayTheme || 'yellow',
        fakeProgressBar: customSettings?.fakeProgressBar ?? true,
        fakeProgressSpeed: customSettings?.fakeProgressSpeed || 'fast',
        onlyProgressBar: customSettings?.onlyProgressBar ?? true,
        hideControls: customSettings?.hideControls ?? false,
        allowPause: customSettings?.allowPause ?? true,
        resumePlayback: customSettings?.resumePlayback ?? true,
        speedControl: customSettings?.speedControl ?? true,
        antiDownload: customSettings?.antiDownload ?? true,
        domainLock: customSettings?.domainLock || '*',
        pitchDelaySeconds: pitch,
        pulsingCta: customSettings?.pulsingCta ?? true,
        ctaText: ctaText || customSettings?.ctaText || 'SIM! QUERO GARANTIR MINHA VAGA COM 50% OFF',
        ctaSubtext: customSettings?.ctaSubtext || 'Acesso imediato • Compra 100% Segura • Garantia de 7 Dias',
        ctaUrl: ctaUrl || customSettings?.ctaUrl || 'https://pay.kiwify.com.br/checkout',
        showWatermark: false,
        thumbSniper: customSettings?.thumbSniper || { enabled: true, templateId: 'ts_01' },
      },
    };

    videosDb[newId] = newVideo;
    saveVideosDb();

    console.log(`[VeloTurb Server] Vídeo ${newId} cadastrado com sucesso! Tipo: ${newVideo.videoType}, URL: ${newVideo.videoUrl}`);

    return res.status(201).json({
      success: true,
      video: newVideo,
      normalized,
    });
  } catch (error: any) {
    console.error('[VeloTurb Server] Erro ao cadastrar vídeo:', error);
    return res.status(500).json({ error: 'Erro interno ao processar vídeo.' });
  }
});

// ROTA 6: PUT /api/videos/:id (Atualizar configurações do vídeo)
app.put('/api/videos/:id', (req, res) => {
  const videoId = req.params.id;
  const existing = videosDb[videoId];

  if (!existing) {
    return res.status(404).json({ error: 'Vídeo não encontrado para atualização.' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: videoId,
    settings: {
      ...existing.settings,
      ...(req.body.settings || {}),
    },
  };

  videosDb[videoId] = updated;
  saveVideosDb();

  return res.json({ success: true, video: updated });
});

// ROTA 7: Streaming com suporte a HTTP 206 Partial Content (Byte Ranges) para vídeos locais
app.get('/uploads/videos/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Vídeo não encontrado');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Accept-Ranges', 'bytes');

  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.webm' ? 'video/webm' : 'video/mp4';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ROTA 8: Upload de MP4 local
app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
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

// ROTA 9: Standalone iframe player com suporte a HLS
app.get('/embed/:id', (req, res) => {
  const videoId = req.params.id;
  const videoRecord = videosDb[videoId];

  const defaultSample = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const videoUrl = req.query.url ? String(req.query.url) : (videoRecord?.videoUrl || defaultSample);
  const unmuteText = req.query.text ? String(req.query.text) : (videoRecord?.settings?.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio');
  const theme = req.query.theme ? String(req.query.theme) : (videoRecord?.settings?.smartAutoplayTheme || 'yellow');
  const primaryColor = videoRecord?.settings?.primaryColor || '#E11D48';
  const pitchDelay = videoRecord?.settings?.pitchDelaySeconds || 15;

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VeloTurb Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  </style>
</head>
<body>
  <div id="veloturb-${videoId}" data-video-id="${videoId}" data-src="${videoUrl}" data-pitch-delay="${pitchDelay}" data-primary-color="${primaryColor}" style="width: 100%; height: 100%;"></div>
  <script src="/player.js"></script>
</body>
</html>`);
});

// Middleware Vite em desenvolvimento ou build estático em produção
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[VeloTurb Server] Rodando na porta ${PORT} com suporte completo a Bunny Stream HLS (.m3u8)`);
});
