// Backend schemalariga aynan mos tiplar (backend/app/schemas/*)

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskSort = "-created_at" | "created_at" | "deadline" | "-deadline" | "priority" | "title";

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null; // "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
  owner_id: number;
  is_overdue: boolean;
}

export interface TaskPage {
  items: Task[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
}

export interface TaskQuery {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sort?: TaskSort;
  page?: number;
  size?: number;
}

export interface DayActivity {
  date: string;
  created: number;
  completed: number;
}

export interface DashboardStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
  due_soon: number;
  completion_rate: number;
  by_priority: Record<TaskPriority, number>;
  upcoming: Task[];
  activity: DayActivity[];
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface ProfileUpdate {
  username?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}
