import type { ProfileUpdate, User } from "../types";
import { api } from "./api";

export const userService = {
  /** GET /users/me */
  async me(signal?: AbortSignal) {
    const { data } = await api.get<User>("users/me", { signal });
    return data;
  },
  /** PATCH /users/me */
  async update(payload: ProfileUpdate) {
    const { data } = await api.patch<User>("users/me", payload);
    return data;
  },
};
