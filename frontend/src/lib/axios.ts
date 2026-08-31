import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Inject JWT token into Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('unipulse_access_token');
      if (accessToken && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const isAuthEndpoint = originalRequest.url?.includes('/api/v1/auth/login') ||
                          originalRequest.url?.includes('/api/v1/auth/register') ||
                          originalRequest.url?.includes('/api/v1/auth/refresh-token');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('unipulse_refresh_token');

        if (!refreshToken) {
          isRefreshing = false;
          localStorage.removeItem('unipulse_access_token');
          localStorage.removeItem('unipulse_refresh_token');
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
            refreshToken,
          });

          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken || refreshToken;

          localStorage.setItem('unipulse_access_token', newAccessToken);
          localStorage.setItem('unipulse_refresh_token', newRefreshToken);

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('unipulse_access_token');
          localStorage.removeItem('unipulse_refresh_token');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);
