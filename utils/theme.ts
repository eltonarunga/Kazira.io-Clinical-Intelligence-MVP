import { safeStorage } from './storage';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'kazira_theme';

/**
 * Retrieves the stored theme, defaulting to 'light' for primarily white background
 */
export function getInitialTheme(): Theme {
  try {
    const stored = safeStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch (e) {
    // fallback
  }
  return 'light';
}

/**
 * Applies the theme to the document root and persists in storage
 */
export function applyTheme(theme: Theme): void {
  try {
    safeStorage.setItem(THEME_STORAGE_KEY, theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {
    console.warn('[Theme] Could not apply theme:', e);
  }
}
