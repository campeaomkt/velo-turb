/**
 * VeloTurb URL Detector & Normalizer
 * Suporte completo a Bunny Stream (HLS .m3u8), MP4 direto e CDN.
 */

export interface NormalizedVideoUrlResult {
  isValid: boolean;
  type: 'hls' | 'mp4';
  src: string;
  poster: string;
  videoId?: string;
  libraryId?: string;
  cdnHostname?: string;
  error?: string;
}

// Hostname padrão configurável oficial da conta do usuário (Library 802485)
export const DEFAULT_BUNNY_CDN_HOSTNAME = 'vz-de50afce-82d.b-cdn.net';

/**
 * Função única e reutilizável de detecção e conversão de URLs de vídeo.
 * Trata:
 * 1. Links de página do Bunny: player.mediadelivery.net/play/LIB_ID/VIDEO_ID
 * 2. Links de iframe do Bunny: iframe.mediadelivery.net/embed/LIB_ID/VIDEO_ID
 * 3. Video IDs isolados (GUIDs)
 * 4. URLs diretas .m3u8 (HLS)
 * 5. URLs diretas .mp4
 * 6. Rejeição de URLs blob: e localhost
 */
export function detectAndNormalizeVideoUrl(
  rawUrl: string,
  customHostname?: string
): NormalizedVideoUrlResult {
  const trimmed = (rawUrl || '').trim();

  // 1. Rejeição obrigatória de blob: e localhost
  if (!trimmed) {
    return {
      isValid: false,
      type: 'mp4',
      src: '',
      poster: '',
      error: 'Por favor, insira a URL do vídeo.',
    };
  }

  if (trimmed.startsWith('blob:')) {
    return {
      isValid: false,
      type: 'mp4',
      src: '',
      poster: '',
      error: 'Use uma URL pública https. Links do tipo "blob:" são temporários e não funcionam em páginas de vendas externas.',
    };
  }

  if (
    trimmed.includes('localhost') ||
    trimmed.includes('127.0.0.1') ||
    trimmed.startsWith('http://')
  ) {
    return {
      isValid: false,
      type: 'mp4',
      src: '',
      poster: '',
      error: 'Use uma URL pública https. Links locais (localhost/127.0.0.1 ou http://) não podem ser acessados por seus clientes.',
    };
  }

  const cdnHost = (customHostname || DEFAULT_BUNNY_CDN_HOSTNAME)
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  // 2. Detecção de URLs do Bunny Stream (player / iframe mediadelivery.net)
  // Exemplo: https://player.mediadelivery.net/play/802485/a818fa3d-82ba-4162-81d0-9a8ad66f0d1f
  // Exemplo: https://iframe.mediadelivery.net/embed/802485/a818fa3d-82ba-4162-81d0-9a8ad66f0d1f
  const bunnyPageRegex = /(?:player|iframe)\.mediadelivery\.net\/(?:play|embed)\/([0-9]+)\/([a-zA-Z0-9-]+)/i;
  const bunnyMatch = trimmed.match(bunnyPageRegex);

  if (bunnyMatch) {
    const libraryId = bunnyMatch[1];
    const videoId = bunnyMatch[2];
    const hlsSrc = `https://${cdnHost}/${videoId}/playlist.m3u8`;
    const poster = `https://${cdnHost}/${videoId}/thumbnail.jpg`;

    return {
      isValid: true,
      type: 'hls',
      src: hlsSrc,
      poster,
      libraryId,
      videoId,
      cdnHostname: cdnHost,
    };
  }

  // 3. Detecção de GUID isolado (se o usuário colou somente o Video ID do Bunny)
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (guidRegex.test(trimmed)) {
    const videoId = trimmed;
    const hlsSrc = `https://${cdnHost}/${videoId}/playlist.m3u8`;
    const poster = `https://${cdnHost}/${videoId}/thumbnail.jpg`;

    return {
      isValid: true,
      type: 'hls',
      src: hlsSrc,
      poster,
      videoId,
      cdnHostname: cdnHost,
    };
  }

  // 4. Detecção de HLS direto (.m3u8 com ou sem query parameters)
  const cleanUrl = trimmed.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.m3u8')) {
    // Tenta extrair o videoId se for padrão Bunny: https://hostname/VIDEO_ID/playlist.m3u8
    const bunnyHlsMatch = trimmed.match(/https?:\/\/([^/]+)\/([a-zA-Z0-9-]+)\/playlist\.m3u8/i);
    let poster = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80';
    let videoId: string | undefined;

    if (bunnyHlsMatch) {
      const extractedHost = bunnyHlsMatch[1];
      videoId = bunnyHlsMatch[2];
      poster = `https://${extractedHost}/${videoId}/thumbnail.jpg`;
    }

    return {
      isValid: true,
      type: 'hls',
      src: trimmed,
      poster,
      videoId,
      cdnHostname: bunnyHlsMatch ? bunnyHlsMatch[1] : cdnHost,
    };
  }

  // 5. Detecção de MP4 direto (.mp4)
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm')) {
    return {
      isValid: true,
      type: 'mp4',
      src: trimmed,
      poster: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    };
  }

  // 6. Se for URL https genérica, aceita com validação
  if (trimmed.startsWith('https://')) {
    return {
      isValid: true,
      type: trimmed.includes('.m3u8') ? 'hls' : 'mp4',
      src: trimmed,
      poster: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    };
  }

  return {
    isValid: false,
    type: 'mp4',
    src: '',
    poster: '',
    error: 'URL inválida. Por favor, insira uma URL https válida do Bunny Stream (.m3u8 ou link do player) ou arquivo .mp4.',
  };
}
