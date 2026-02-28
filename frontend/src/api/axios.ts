import axios from 'axios';

const api = axios.create({
    baseURL: 'https://campus-l-f.onrender.com/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Shared in-flight promise to serialize concurrent 401 → refresh calls (BUG-03)
let refreshPromise: Promise<any> | null = null;

// Auto-refresh on 401; friendly message on 429
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // Rate limit hit — surface a clear message instead of a raw error
        if (error.response?.status === 429) {
            return Promise.reject(
                new Error('Too many attempts. Please wait a moment and try again.')
            );
        }

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // All concurrent 401s share one refresh call
                    if (!refreshPromise) {
                        refreshPromise = axios
                            .post('/api/auth/refresh', { refreshToken })
                            .finally(() => { refreshPromise = null; });
                    }
                    const { data } = await refreshPromise;
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    original.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(original);
                } catch {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    },
);

export default api;
