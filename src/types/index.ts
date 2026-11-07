export interface PlayerSettings {
  primaryColor: string;
  smartAutoplay: boolean;
  smartAutoplayText: string;
  smartAutoplayTheme: 'yellow' | 'black' | 'red' | 'purple';
  fakeProgressBar: boolean;
  fakeProgressSpeed: 'moderate' | 'fast';
  hideControls: boolean;
  allowPause: boolean;
  resumePlayback: boolean;
  speedControl: boolean;
  antiDownload: boolean;
  domainLock: string;
  pitchDelaySeconds: number; // In seconds, e.g. 720s = 12min
  pulsingCta: boolean;
  ctaText: string;
  ctaSubtext: string;
  ctaUrl: string;
  showWatermark: boolean;
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
