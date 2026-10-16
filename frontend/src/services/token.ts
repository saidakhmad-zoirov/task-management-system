const KEY = "taskpulse-token";

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      /* private rejimda localStorage yopiq bo'lishi mumkin */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* e'tiborsiz */
    }
  },
};

export const SESSION_EXPIRED_EVENT = "taskpulse:session-expired";
