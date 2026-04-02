import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN || "").replace(
  /\/$/,
  ""
);

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("viode-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const resolveMediaUrl = (path = "") => {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return backendOrigin ? `${backendOrigin}${path}` : path;
};

