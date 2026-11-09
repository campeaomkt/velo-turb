export interface PlayerSettings {
  primaryColor: string;
  smartAutoplay: boolean;
  smartAutoplayText: string;
  smartAutoplayTheme: 'yellow' | 'black' | 'red' | 'purple';
  smartAutoplayShape?: 'pill' | 'square' | 'rounded' | 'two_lines' | 'full_width' | 'minimal';
  smartAutoplayPosition?: 'top' | 'center' | 'bottom' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
  smartAutoplayOpacity?: number; // 20 to 100
  smartAutoplaySubtext?: string; // Subtexto para modelo de duas linhas
  fakeProgressBar: boolean;
  fakeProgressSpeed: 'moderate' | 'fast';
  onlyProgressBar: boolean; // VSL standard: only shows bottom progress bar, hides play/pause/timestamps
  hideControls: boolean;
  allowPause: boolean;
  resumePlayback: boolean;
  resumePlaybackPrompt?: boolean; // Exibe o card laranja de retomada inteligente (image_8f1ffac5.png)
  resumePlaybackLanguage?: 'pt' | 'es'; // Português ou Espanhol LATAM
  resumePlaybackTitle?: string;
  resumePlaybackContinueText?: string;
  resumePlaybackRestartText?: string;
  speedControl: boolean;
  antiDownload: boolean;
  domainLock: string;
  pitchDelaySeconds: number; // In seconds, e.g. 720s = 12min
  pulsingCta: boolean;
  ctaText: string;
  ctaSubtext: string;
  ctaUrl: string;
  showWatermark: boolean;
  thumbSniper?: ThumbSniperSettings;
}

export interface ThumbSniperSettings {
  enabled: boolean;
  name?: string;
  type: 'template' | 'custom';
  templateId?: string;
  language?: 'pt' | 'es'; // Português ou Espanhol LATAM
  customMediaUrl?: string; // custom GIF or image
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonColor?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  folderId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // In seconds
  plays: number;
  views: number;
  playRate: number; // % (plays / views)
  pitchTime: number; // Pitch seconds
  retentionAtPitch: number; // % viewer retention at pitch
  settings: PlayerSettings;
  createdAt: string;
  videoType?: 'hls' | 'mp4';
  bunnyVideoId?: string;
  bunnyLibraryId?: string;
  bunnyCdnHostname?: string;
  isTrash?: boolean;
  isTop?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  videoCount?: number;
}

export interface ABTest {
  id: string;
  name: string;
  videoAId: string;
  videoBId: string;
  trafficSplit: number; // e.g. 50 (50/50)
  playsA: number;
  playsB: number;
  conversionsA: number;
  conversionsB: number;
  status: 'active' | 'paused' | 'concluded';
  createdAt: string;
}

export type ActiveTab = 'videos' | 'hosting' | 'ab_tests' | 'security' | 'conversions' | 'settings' | 'academy' | 'help';
