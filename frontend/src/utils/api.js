import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry && !err.config.url?.includes("/auth/")) {
      err.config._retry = true;
      try {
        await axios.post(`${API}/auth/refresh`, {}, { withCredentials: true });
        return api(err.config);
      } catch {
        // Let the component handle the auth redirect
      }
    }
    return Promise.reject(err);
  }
);

export function formatError(detail) {
  if (!detail) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
}

export default api;
