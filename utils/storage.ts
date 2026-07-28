// Safe storage wrapper utility that handles iframe-specific security restrictions
// (e.g. DOMException: Failed to read the 'localStorage' property from 'Window': Access is denied for this document)
// and handles browser private browsing modes gracefully.

class SafeStorage {
  private inMemoryStore: Record<string, string> = {};

  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      // Fallback to in-memory store
      return this.inMemoryStore[key] !== undefined ? this.inMemoryStore[key] : null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // Fallback to in-memory store
      this.inMemoryStore[key] = String(value);
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete this.inMemoryStore[key];
    }
  }

  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      this.inMemoryStore = {};
    }
  }
}

export const safeStorage = new SafeStorage();
