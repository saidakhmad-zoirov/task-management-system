import type { DashboardStats } from "../types";
import { api } from "./api";

export const dashboardService = {
  /** GET /dashboard/stats */
  async stats(signal?: AbortSignal) {
    const { data } = await api.get<DashboardStats>("dashboard/stats", { signal });
    return data;
  },
  /** GET /health — landing'dagi "API online" belgisi uchun */
  async health() {
    const { data } = await api.get<{ status: string }>("health", { timeout: 4000 });
    return data.status === "ok";
  },
};
