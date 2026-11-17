/**
 * Cognevance Technologies - Centralized API Service
 * 
 * Handles all HTTP communication with the backend:
 * - Automatically resolves the API Base URL from import.meta.env.VITE_API_BASE_URL
 * - Automatically normalizes trailing slashes and the '/api' prefix
 * - Injects JWT Bearer authentication token from localStorage
 * - Provides graceful fallback handling
 * - Centralizes REST methods (GET, POST, PUT, DELETE)
 */

/**
 * Normalizes the configured base URL to ensure clean endpoint resolution.
 * Supports values such as:
 *   "https://cognevance-lms-backend.onrender.com"
 *   "https://cognevance-lms-backend.onrender.com/"
 *   "https://cognevance-lms-backend.onrender.com/api"
 *   "https://cognevance-lms-backend.onrender.com/api/"
 */
const normalizeBaseUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let clean = rawUrl.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
};

// Determine primary and fallback API URLs
const getBaseUrls = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const primary = normalizeBaseUrl(envUrl);
    // In local development, allow fallback to localhost:5000 if cloud backend is unreachable
    if (import.meta.env.DEV) {
      return [primary, 'http://localhost:5000/api', '/api'];
    }
    return [primary];
  }

  // Default development fallback: direct port 5000, then Vite dev proxy
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
    // If baseUrl ends with /api and endpoint begins with /api/, avoid duplicate /api/api
    const resolvedEndpoint =
      baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')
        ? cleanEndpoint.substring(4)
        : cleanEndpoint;

    const url = `${baseUrl}${resolvedEndpoint}`;

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
      // If error was a network error (e.g. host unreachable), try next fallback baseUrl if available
      if (error instanceof TypeError && error.message.includes('fetch')) {
        continue;
      }
      // If it was an HTTP response error (4xx/5xx returned by server), throw it directly
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
