/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/authUtils.ts
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // You may need to install this package

// Admin role ID constant
export const ADMIN_ROLE_ID = "d000e331-249d-413f-9af1-6e056f7c1c86";

// Interface for decoded JWT
interface DecodedToken {
  iss: string;
  aud: string;
  sub: string; // User ID
  exp: number; // Expiration time
  iat: number; // Issued at time
}

// Interface for user data
export interface User {
  id: string;
  username: string;
  roleId: string;
  email?: string;
}

/**
 * Get the auth token from cookies
 */
export const getToken = (): string | null => {
  return Cookies.get("auth_token") || null;
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Check if the user has admin role
 */
export const isAdmin = (): boolean => {
  if (!isAuthenticated()) return false;
  
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return false;
    
    const user = JSON.parse(userStr) as User;
    return user.roleId === ADMIN_ROLE_ID;
  } catch (error) {
    return false;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) return null;
  
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    return JSON.parse(userStr) as User;
  } catch (error) {
    return null;
  }
};

/**
 * Logout user by removing token and user data
 */
export const logout = (): void => {
  Cookies.remove("auth_token");
  localStorage.removeItem("user");
};

/**
 * Add auth token to API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { "Authorization": `Bearer ${token}` } : {};
};