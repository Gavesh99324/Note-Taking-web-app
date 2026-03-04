import api from "../utils/api";
import { LoginCredentials, RegisterData, AuthResponse } from "../types";

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async logoutAll(): Promise<void> {
    await api.post("/auth/logout-all");
  },
};
