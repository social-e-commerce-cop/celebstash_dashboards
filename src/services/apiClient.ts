export const API_BASE_URL = 'http://localhost:8080';

const ensureAdminToken = async (): Promise<string> => {
  const session = localStorage.getItem('zikii_admin_session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed.token || parsed.accessToken) {
        return parsed.token || parsed.accessToken;
      }
    } catch (e) {
      console.error('Failed to parse admin session', e);
    }
  }

  try {
    const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'karabogretta@gmail.com',
        email: 'karabogretta@gmail.com',
        password: 'admin123',
      }),
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      const token = data.accessToken || data.token;
      if (token) {
        const sessionData = {
          id: String(data.userId || data.id || 'admin_user'),
          email: data.email || 'karabogretta@gmail.com',
          fullName: data.fullName || 'Emmy Gretta',
          name: data.fullName || 'Emmy Gretta',
          role: 'ADMIN',
          avatarUrl: '/images/admin_avatar.png',
          token,
        };
        localStorage.setItem('zikii_admin_session', JSON.stringify(sessionData));
        return token;
      }
    }
  } catch (e) {
    console.error('Auto admin login failed:', e);
  }
  return '';
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, isRetry = false): Promise<Response> => {
  let token = await ensureAdminToken();

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

  if ((response.status === 401 || response.status === 403) && !isRetry) {
    console.warn('Unauthorized request, re-authenticating admin session for:', fullUrl);
    localStorage.removeItem('zikii_admin_session');
    const newToken = await ensureAdminToken();
    if (newToken) {
      reqHeaders['Authorization'] = `Bearer ${newToken}`;
      return fetch(fullUrl, {
        ...options,
        headers: reqHeaders,
      });
    }
  }

  return response;
};
