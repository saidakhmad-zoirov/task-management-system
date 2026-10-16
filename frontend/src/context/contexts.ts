import { createContext } from "react";

import type { ProfileUpdate, RegisterInput, User } from "../types";

export interface AuthState {
  user: User | null;
  ready: boolean; // sahifa ochilganda saqlangan token tekshirildimi
  login: (login: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  updateProfile: (patch: ProfileUpdate) => Promise<User>;
  logout: () => void;
}

export type ToastKind = "success" | "error" | "info";
export interface ToastState {
  notify: (message: string, kind?: ToastKind) => void;
}

export const AuthContext = createContext<AuthState | null>(null);
export const ToastContext = createContext<ToastState | null>(null);
