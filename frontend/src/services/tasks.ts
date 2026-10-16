import type { Task, TaskInput, TaskPage, TaskQuery } from "../types";
import { api } from "./api";

function clean(query: TaskQuery) {
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ""));
}

export const taskService = {
  /** GET /tasks/ — qidiruv, filter, saralash, sahifalash */
  async list(query: TaskQuery, signal?: AbortSignal) {
    const { data } = await api.get<TaskPage>("tasks/", { params: clean(query), signal });
    return data;
  },
  /** GET /tasks/{id} */
  async get(id: number | string, signal?: AbortSignal) {
    const { data } = await api.get<Task>(`tasks/${id}`, { signal });
    return data;
  },
  /** POST /tasks/ */
  async create(input: TaskInput) {
    const { data } = await api.post<Task>("tasks/", input);
    return data;
  },
  /** PATCH /tasks/{id} — faqat o'zgargan maydonlar */
  async update(id: number, patch: Partial<TaskInput>) {
    const { data } = await api.patch<Task>(`tasks/${id}`, patch);
    return data;
  },
  /** DELETE /tasks/{id} */
  async remove(id: number) {
    await api.delete(`tasks/${id}`);
  },
};
