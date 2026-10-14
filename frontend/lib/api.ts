import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Créer une instance axios avec configuration par défaut
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour les cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthCall) {
      // Token expiré ou non valide
      if (typeof window !== 'undefined') {
        // Rediriger vers login côté client
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
