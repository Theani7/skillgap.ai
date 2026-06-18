import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let logoutHandler = null;
export const registerLogoutHandler = (fn) => { logoutHandler = fn; };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;
    const url = config.url || '';
    const skipRedirect = config._skipAuthRedirect;
    const isAuthMe = url.includes('/auth/me');

    if (status === 401 && !isAuthMe && !skipRedirect) {
      if (logoutHandler) {
        logoutHandler();
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
