export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://celebstash-back-3.onrender.com';

const ADMIN_LOGOUT_EVENT = 'zikii-admin-logout';

export function emitAdminLogout() {
  localStorage.removeItem('zikii_admin_session');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_LOGOUT_EVENT));
  }
}

export function onAdminLogout(handler: () => void) {
  window.addEventListener(ADMIN_LOGOUT_EVENT, handler);
  return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, handler);
}

export const isAdminRole = (role?: string | null): boolean =>
  String(role || '').toUpperCase() === 'ADMIN';

const getAdminToken = (): string => {
  const session = localStorage.getItem('zikii_admin_session');
  if (!session) return '';
  try {
    const parsed = JSON.parse(session);
    if (!isAdminRole(parsed.role)) {
      return '';
    }
    return parsed.token || parsed.accessToken || '';
  } catch (e) {
    console.error('Failed to parse admin session', e);
    return '';
  }
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAdminToken();

  const reqHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => { reqHeaders[k] = v; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => { reqHeaders[k] = v; });
    } else {
      Object.assign(reqHeaders, options.headers);
    }
  }

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }
  if (!reqHeaders['Content-Type'] && !(options.body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  const fullUrl = endpoint.startsWith('http')
    ? endpoint
    : endpoint.startsWith('/api')
      ? `${API_BASE_URL}${endpoint}`
      : endpoint.startsWith('/products')
        ? `${API_BASE_URL}/api${endpoint}`
        : `${API_BASE_URL}/api/v1${endpoint}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: reqHeaders,
  });

  if (response.status === 401) {
    emitAdminLogout();
  }

  return response;
};
