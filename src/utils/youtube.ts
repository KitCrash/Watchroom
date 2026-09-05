export interface ShortItem {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  url: string;
  likesCount: string;
  label?: string;
  isShort?: boolean;
}

export type SampleVideo = ShortItem;

export const SAMPLE_SHORTS_FEED: ShortItem[] = [
  {
    id: 's1',
    videoId: 'cWENS05O3m0',
    title: 'Best proposal 💀💯✅ #trending',
    channel: 'MumDeep',
    url: 'https://www.youtube.com/shorts/cWENS05O3m0',
    likesCount: '2.4M',
    isShort: true,
  },
  {
    id: 's2',
    videoId: 'uQYHwnb445U',
    title: 'She 😡 #bengali #couple #shorts',
    channel: 'Sou Mani',
    url: 'https://www.youtube.com/shorts/uQYHwnb445U',
    likesCount: '1.8M',
    isShort: true,
  },
  {
    id: 's3',
    videoId: 'eUvABatCFyw',
    title: 'True Love ❤️🗿 #bangla #bongguy #funny',
    channel: 'Your Bong Guy',
    url: 'https://www.youtube.com/shorts/eUvABatCFyw',
    likesCount: '950K',
    isShort: true,
  },
  {
    id: 's4',
    videoId: '5XgyL4cLXPU',
    title: 'bhalobasa status / love shayari #shorts',
    channel: 'Konthe Ankan',
    url: 'https://www.youtube.com/shorts/5XgyL4cLXPU',
    likesCount: '820K',
    isShort: true,
  },
  {
    id: 's5',
    videoId: 'SjM589oY9bc',
    title: 'Love Status 💏❤ ভালোবাসার স্ট্যাটাস #shorts',
    channel: 'ভালোবাসার কাব্য',
    url: 'https://www.youtube.com/shorts/SjM589oY9bc',
    likesCount: '640K',
    isShort: true,
  },
  {
    id: 's6',
    videoId: '0d4xJTfXz9g',
    title: 'Black dress style || #shorts #trending',
    channel: 'Style Vibe',
    url: 'https://www.youtube.com/shorts/0d4xJTfXz9g',
    likesCount: '1.1M',
    isShort: true,
  },
  {
    id: 's7',
    videoId: 'LFpBR2n4CoI',
    title: 'Bugatti trend with rabbit 🐇 #shorts #edit',
    channel: 'Speed Reels',
    url: 'https://www.youtube.com/shorts/LFpBR2n4CoI',
    likesCount: '3.2M',
    isShort: true,
  },
];

export const SAMPLE_SHORTS = SAMPLE_SHORTS_FEED;

export function extractYouTubeId(urlOrId: string): { id: string; isShort: boolean } | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { id: trimmed, isShort: true };
  }

  // Handle youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) {
    return { id: shortsMatch[1], isShort: true };
  }

  // Handle youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return { id: shortMatch[1], isShort: false };
  }

  // Handle youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    return { id: watchMatch[1], isShort: false };
  }

  // Handle youtube.com/embed/<id>
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) {
    return { id: embedMatch[1], isShort: false };
  }

  return null;
}
