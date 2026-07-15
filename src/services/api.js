import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gila-house-backend-production.up.railway.app/api', // import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s timeout
});

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Session Expiry (except for activity-logs which might be restricted by role)
    if (error.response?.status === 401) {
      if (!error.config?.url?.includes('/activity-logs')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('🌐 API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    return Promise.reject(error);
  }
);

export default api;
