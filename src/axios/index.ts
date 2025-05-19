// lib/api.ts
import axios from "axios";
import { getAuthHeaders } from "../utils/authUtils";

// Create a base axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const headers = getAuthHeaders();
    if (config.headers) {
      Object.entries(headers).forEach(([key, value]) => {
        config.headers.set(key, value);
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (username: string, password: string) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const logout = async () => {
  return await api.post("/auth/logout");
};

// Example of an API that requires authentication
export const getUserProfile = async () => {
  return await api.get("/users/profile");
};

// Other API endpoints
// ...

export default api;