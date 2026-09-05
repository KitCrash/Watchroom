import { fetchLiveShorts } from './youtubeApi';
import { fetchPipedShorts } from './pipedApi';
import type { ShortItem } from '../utils/youtube';

export type ApiProvider = 'piped' | 'youtube';

export interface FetchShortsParams {
  provider: ApiProvider;
  pageToken?: string | null;
  query?: string;
  customPipedUrl?: string;
}

export interface FetchShortsResult {
  items: ShortItem[];
  nextPageToken: string | null;
  providerUsed: ApiProvider;
  instanceUsed?: string;
  notice?: string | null;
}

/**
 * Unified shorts fetcher that supports both Piped API (unlimited/no quota)
 * and YouTube Data API v3, with automatic graceful fallback.
 */
export async function fetchShortsFeed(params: FetchShortsParams): Promise<FetchShortsResult> {
  const { provider, pageToken = null, query = '#shorts trending viral', customPipedUrl } = params;

  if (provider === 'piped') {
    try {
      const pipedResult = await fetchPipedShorts(pageToken, query, customPipedUrl);
      if (pipedResult.items.length > 0) {
        return {
          items: pipedResult.items,
          nextPageToken: pipedResult.nextPageToken,
          providerUsed: 'piped',
          instanceUsed: pipedResult.instanceUsed,
          notice: null,
        };
      }
    } catch (err: any) {
      console.warn('Piped API unavailable, falling back to YouTube API:', err.message);
      // Seamless auto-fallback to YouTube Data API
      const ytResult = await fetchLiveShorts(pageToken, query);
      return {
        items: ytResult.items,
        nextPageToken: ytResult.nextPageToken,
        providerUsed: 'youtube',
        notice: 'Public Piped instances unreachable. Seamlessly fell back to YouTube API.',
      };
    }
  }

  // Official YouTube Data API
  const ytResult = await fetchLiveShorts(pageToken, query);
  return {
    items: ytResult.items,
    nextPageToken: ytResult.nextPageToken,
    providerUsed: 'youtube',
    notice: null,
  };
}
