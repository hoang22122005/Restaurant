import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach X-Site-Id header to every request
httpClient.interceptors.request.use((config) => {
  const siteId = localStorage.getItem('X-Site-Id') || 'MAIN';
  config.headers['X-Site-Id'] = siteId;
  return config;
});

// Basic error interceptor
httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Network error';
    console.error('[API Error]', msg);
    return Promise.reject(err);
  }
);

export default httpClient;
