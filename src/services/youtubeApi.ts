import type { ShortItem } from '../utils/youtube';

export const YOUTUBE_API_KEY =
  (import.meta.env.VITE_YOUTUBE_API_KEY as string) ||
  'AIzaSyC5lzUaxMzLu59I_NZzBNUMeEdPNnRYeNQ';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface ShortsApiResponse {
  items: ShortItem[];
  nextPageToken: string | null;
}

export const POPULAR_SHORTS_TOPICS = [
  { label: '🔥 Trending', query: '#shorts trending viral' },
  { label: '😂 Funny & Comedy', query: '#shorts funny comedy' },
  { label: '🐱 Cute Pets', query: '#shorts cute animals cat dog' },
  { label: '🍳 Food & Cooking', query: '#shorts street food cooking' },
  { label: '✨ Satisfying', query: '#shorts satisfying art' },
  { label: '🎮 Gaming', query: '#shorts gaming clips' },
];

function decodeHtmlEntities(str: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body.textContent || str;
}

export async function fetchLiveShorts(
  pageToken: string | null = null,
  query: string = '#shorts trending viral'
): Promise<ShortsApiResponse> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoDuration', 'short');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '25');
  url.searchParams.set('key', YOUTUBE_API_KEY);

  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `YouTube API Error (${res.status}): ${res.statusText}`
    );
  }

  const data = await res.json();

  const items: ShortItem[] = (data.items || [])
    .filter((item: any) => item?.id?.videoId)
    .map((item: any) => ({
      id: item.id.videoId,
      videoId: item.id.videoId,
      title: decodeHtmlEntities(item.snippet.title || 'YouTube Short'),
      channel: decodeHtmlEntities(item.snippet.channelTitle || '@Creator'),
      url: `https://www.youtube.com/shorts/${item.id.videoId}`,
      likesCount: 'Live API',
      isShort: true,
    }));

  return {
    items,
    nextPageToken: data.nextPageToken || null,
  };
}
