// Determine primary and fallback API URLs
const getBaseUrls = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return [import.meta.env.VITE_API_BASE_URL];
  }
  // Try direct backend port 5000 first (backed by CORS), then Vite proxy /api
  return ['http://localhost:5000/api', '/api'];
};

/**
 * Universal API request wrapper with JWT token injection, automatic fallback, and clean error handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cognevance_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrls = getBaseUrls();
  let lastError = null;

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}${cleanEndpoint}`;
    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      lastError = error;
      // If error was a network error (e.g. port 5000 not reachable), try next baseUrl
      if (error instanceof TypeError && error.message.includes('fetch')) {
        continue;
      }
      // If it was an HTTP error (4xx/5xx returned by server), throw it directly
      throw error;
    }
  }

  console.error(`API Error on [${options.method || 'GET'} ${cleanEndpoint}]:`, lastError?.message);
  throw lastError || new Error('Network error. Unable to reach backend API.');
};

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options = {}) => request(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options = {}) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;
