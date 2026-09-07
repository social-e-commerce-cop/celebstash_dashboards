import { API_BASE_URL } from '../services/apiClient';

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
    return url;
  }
  return url;
}

