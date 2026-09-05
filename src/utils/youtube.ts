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
    videoId: 'M576WGiDBdQ',
    title: 'Cute Cat Jump Mishap & Surprise 🐱',
    channel: '@CatMoments',
    url: 'https://www.youtube.com/shorts/M576WGiDBdQ',
    likesCount: '1.2M',
  },
  {
    id: 's2',
    videoId: 'k1BneeJTDcU',
    title: 'Satisfying Japanese Rolled Omelette Flip 🍳',
    channel: '@ChefTasting',
    url: 'https://www.youtube.com/shorts/k1BneeJTDcU',
    likesCount: '840K',
  },
  {
    id: 's3',
    videoId: 'linlz7-Pnvw',
    title: 'Cinematic Swiss Alps Waterfall Sunset 🏔️',
    channel: '@DroneVibes',
    url: 'https://www.youtube.com/shorts/linlz7-Pnvw',
    likesCount: '520K',
  },
  {
    id: 's4',
    videoId: 'aqz-KE-bpKQ',
    title: 'Classic Animation: Big Buck Bunny Moment 🐰',
    channel: '@BlenderOpen',
    url: 'https://www.youtube.com/shorts/aqz-KE-bpKQ',
    likesCount: '2.1M',
  },
  {
    id: 's5',
    videoId: 'jfKfPfyJRdk',
    title: 'Cozy Rainy Lofi Cafe Window Beats ☕',
    channel: '@ChillHopLoFi',
    url: 'https://www.youtube.com/shorts/jfKfPfyJRdk',
    likesCount: '950K',
  },
  {
    id: 's6',
    videoId: '9bZkp7q19f0',
    title: 'Legendary Dance Iconic Move 🕺',
    channel: '@KpopReels',
    url: 'https://www.youtube.com/shorts/9bZkp7q19f0',
    likesCount: '3.4M',
  },
  {
    id: 's7',
    videoId: 'dQw4w9WgXcQ',
    title: 'Unforgettable 80s Musical Chorus 🎶',
    channel: '@RetroGroove',
    url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    likesCount: '15M',
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
