import { api } from "./client.ts";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
  hasGoogle?: boolean;
}

interface AuthResponse {
  user: User;
}

export const authApi = {
  register: (data: { email: string; password: string; displayName?: string }) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),

  googleLogin: (data: {
    googleId: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
  }) => api.post<AuthResponse>("/auth/google", data),

  logout: () => api.post<{ ok: boolean }>("/auth/logout"),

  me: () => api.get<AuthResponse>("/auth/me"),
};
