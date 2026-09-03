export function formatImageUrl(url?: string | null): string {
  if (!url) return '/images/admin_avatar.png';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/api/')) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:8080${url}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith('/api/files/')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        return `http://${host}:8080${parsed.pathname}`;
      }
    } catch (e) {}
    return url;
  }
  return url;
}
