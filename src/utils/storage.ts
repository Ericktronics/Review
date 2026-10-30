import { useCallback, useState } from 'react';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);  } catch {
    return fallback;
  }
}

/** useState that survives reloads. Storage failures (private mode, full quota) only lose persistence. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = next instanceof Function ? next(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Keep working in memory
      }
      return resolved;
    });
  }, [key]);

  return [value, set] as const;
}
