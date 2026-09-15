import { API_BASE_URL } from '../services/apiClient';

/**
 * Ensures a Cloudinary delivery URL carries the `f_auto` transformation.
 *
 * Phones upload in their native format — iOS sends HEIC, which no mainstream browser can render,
 * so such an image loads on the phone but appears broken here. `f_auto` makes Cloudinary transcode
 * per request (WebP/JPEG) and `q_auto` trims the payload. Applied defensively so URLs already
 * stored without a transformation still display.
 */
function withCloudinaryAutoFormat(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx < 0) return url;

  const insertAt = idx + marker.length;
  const rest = url.slice(insertAt);
  // Already transformed (a transformation segment precedes the /v<version>/ or public id).
  if (/^[^/]*(^|,)(f_auto|f_)/.test(rest)) return url;

  return `${url.slice(0, insertAt)}f_auto,q_auto/${rest}`;
}

export function formatImageUrl(url?: string | null): string {
  if (!url) return '/images/admin_avatar.png';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/api/')) {
    return `${API_BASE_URL}${url}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      // Rewrite any localhost:8080 URLs from backend records to production base URL
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${API_BASE_URL}${parsed.pathname}${parsed.search}`;
      }
    } catch (e) {}
    return withCloudinaryAutoFormat(url);
  }
  return url;
}

