import type { RegisterInput, TokenResponse, User } from "../types";
import { api } from "./api";
import { tokenStore } from "./token";

export const authService = {
  /** POST /auth/register — javobda token ham keladi */
  async register(input: RegisterInput) {
    const { data } = await api.post<TokenResponse>("auth/register", input);
    tokenStore.set(data.access_token);
    return data.user;
  },
  /** POST /auth/login — OAuth2 forma: username maydoniga username yoki email */
  async login(login: string, password: string) {
    const form = new URLSearchParams({ username: login, password });
    const { data } = await api.post<TokenResponse>("auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    tokenStore.set(data.access_token);
    return data.user;
  },
  /** GET /auth/me */
  async me() {
    const { data } = await api.get<User>("auth/me");
    return data;
  },
  logout() {
    tokenStore.clear();
  },
};
