import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartStudyToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setAuthToken = (token) => {
  if (token) localStorage.setItem("smartStudyToken", token);
  else localStorage.removeItem("smartStudyToken");
};

export const getStoredUser = () => {
  const raw = localStorage.getItem("smartStudyUser");
  return raw ? JSON.parse(raw) : null;
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem("smartStudyUser", JSON.stringify(user));
  else localStorage.removeItem("smartStudyUser");
};

export const clearSession = () => {
  localStorage.removeItem("smartStudyToken");
  localStorage.removeItem("smartStudyUser");
};

export const fetchAIInsights = async () => {
  const response = await api.get("/ai/insights");
  return response.data.data;
};
