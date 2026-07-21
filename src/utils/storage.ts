function safeWindow(): Window | null {
  return typeof window === "undefined" ? null : window;
}

export const storage = {
  get<T = unknown>(key: string, fallback: T | null = null): T | null {
    const w = safeWindow();
    if (!w) return fallback;
    try {
      const raw = w.localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    const w = safeWindow();
    if (!w) return;
    try {
      w.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / privacy mode — ignore */
    }
  },
  remove(key: string): void {
    const w = safeWindow();
    if (!w) return;
    w.localStorage.removeItem(key);
  },
};
