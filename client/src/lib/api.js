import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const TOKEN_KEY = "chitra_access";
export const REFRESH_KEY = "chitra_refresh";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshing = null;

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original?._retry && !original?.url?.includes("/auth/")) {
      original._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
      }

      try {
        refreshing =
          refreshing ||
          api.post("/auth/refresh", { refreshToken }).then(({ data }) => {
            setTokens(data.tokens);
            return data.tokens.accessToken;
          });
        const newToken = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        refreshing = null;
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.error || err?.message || fallback;
}

export default api;
