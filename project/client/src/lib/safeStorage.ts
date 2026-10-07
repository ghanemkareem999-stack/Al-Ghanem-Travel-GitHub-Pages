const transientStorage = new Map<string, string>();

function localStorageOrNull(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorageOrNull()?.getItem(key) ?? transientStorage.get(key) ?? null;
  } catch {
    return transientStorage.get(key) ?? null;
  }
}

export function safeLocalStorageSet(key: string, value: string): void {
  transientStorage.set(key, value);
  try {
    localStorageOrNull()?.setItem(key, value);
  } catch {
    // Browser privacy settings can deny localStorage. Persistence is optional.
  }
}
