export const storage = {
  getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { try { localStorage.setItem(key, value); } catch { /* Private mode can deny storage. */ } },
  removeItem(key) { try { localStorage.removeItem(key); } catch { /* Keep this session usable. */ } },
};
