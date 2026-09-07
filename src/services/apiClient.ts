const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://celebstash-back-3.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

const REQUEST_TIMEOUT_MS = 30000; // 30 seconds for Render cold starts

export const ensureAdminToken = async (): Promise<string> => {
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
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

    const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller?.signal,
      body: JSON.stringify({
        identifier: 'karabogretta@gmail.com',
        email: 'karabogretta@gmail.com',
        password: 'admin123',
      }),
    });

    if (timeoutId) clearTimeout(timeoutId);

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
          avatarUrl: data.profilePicture || '/images/admin_avatar.png',
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

export const resolveApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  if (endpoint.startsWith('/api/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  if (endpoint.startsWith('/products') || endpoint.startsWith('/files') || endpoint.startsWith('/orders') || endpoint.startsWith('/cart')) {
    return `${API_BASE_URL}/api${endpoint}`;
  }
  return `${API_BASE_URL}/api/v1${endpoint}`;
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> => {
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

  const fullUrl = resolveApiUrl(endpoint);

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: reqHeaders,
      signal: controller?.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

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
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`Request to ${fullUrl} timed out after ${REQUEST_TIMEOUT_MS}ms (Render cold start)`);
    }
    throw error;
  }
};

export const apiClient = {
  get: (endpoint: string, options?: RequestInit) =>
    fetchWithAuth(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, body?: any, options?: RequestInit) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  put: (endpoint: string, body?: any, options?: RequestInit) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  patch: (endpoint: string, body?: any, options?: RequestInit) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};
