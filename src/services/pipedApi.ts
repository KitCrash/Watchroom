import type { ShortItem } from '../utils/youtube';

export const DEFAULT_PIPED_INSTANCES: string[] = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.leptons.xyz',
  'https://piped-api.lunar.icu',
  'https://api.piped.privacydev.net',
  'https://pipedapi.ducks.party',
];

export interface PipedApiResponse {
  items: ShortItem[];
  nextPageToken: string | null;
  instanceUsed: string;
}

function decodeHtmlEntities(str: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body.textContent || str;
}

function extractIdFromUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || url.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

/**
 * Fetch shorts from a specific Piped instance with a timeout.
 */
async function fetchFromInstance(
  instanceUrl: string,
  query: string,
  nextPageToken?: string | null,
  timeoutMs: number = 3500
): Promise<PipedApiResponse> {
  const cleanBase = instanceUrl.replace(/\/+$/, '');
  const url = nextPageToken
    ? `${cleanBase}/nextpage/search?nextpage=${encodeURIComponent(nextPageToken)}&q=${encodeURIComponent(query)}&filter=all`
    : `${cleanBase}/search?q=${encodeURIComponent(query)}&filter=all`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Instance ${cleanBase} responded with status ${res.status}`);
    }

    const data = await res.json();
    const rawItems: any[] = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];

    const items: ShortItem[] = rawItems
      .filter((item: any) => item && (item.url || item.id))
      .map((item: any) => {
        const videoId = extractIdFromUrl(item.url) || item.id || '';
        return {
          id: `piped-${videoId || Math.random().toString(36).slice(2)}`,
          videoId,
          title: decodeHtmlEntities(item.title || 'YouTube Short'),
          channel: decodeHtmlEntities(item.uploaderName || item.channel || '@Creator'),
          url: `https://www.youtube.com/shorts/${videoId}`,
          likesCount: item.views ? `${item.views.toLocaleString()} views` : 'Piped API',
          isShort: true,
        };
      })
      .filter((item: ShortItem) => item.videoId.length === 11);

    return {
      items,
      nextPageToken: data.nextpage || null,
      instanceUsed: cleanBase,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch shorts via Piped API.
 * First tries custom instance if provided, then walks through public instances pool.
 */
export async function fetchPipedShorts(
  nextPageToken: string | null = null,
  query: string = '#shorts trending viral',
  customInstance?: string
): Promise<PipedApiResponse> {
  const candidateInstances: string[] = [];

  if (customInstance && customInstance.trim()) {
    candidateInstances.push(customInstance.trim());
  }

  candidateInstances.push(...DEFAULT_PIPED_INSTANCES);

  const errors: string[] = [];

  for (const instance of candidateInstances) {
    try {
      const result = await fetchFromInstance(instance, query, nextPageToken, 3000);
      if (result.items.length > 0) {
        return result;
      }
    } catch (err: any) {
      errors.push(`${instance}: ${err.message || err}`);
    }
  }

  throw new Error(`All Piped instances failed: ${errors.slice(0, 3).join('; ')}`);
}
