/**
 * Safe fetch utilities for robust error handling
 * Prevents crashes from network errors, null responses, and edge cases
 */

type SafeResult<T> = {
  data: T | null;
  error: Error | null;
};

type SafeArrayResult<T> = {
  data: T[];
  error: Error | null;
};

/**
 * Safely execute async operation - never throws
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<{ data: T; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    console.error('Safe async error:', err);
    return { data: defaultValue, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Safe property access - prevents null/undefined crashes
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, defaultValue: T[K]): T[K] {
  if (obj === null || obj === undefined) return defaultValue;
  const value = obj[key];
  return value === undefined || value === null ? defaultValue : value;
}

/**
 * Safe array access - always returns an array
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Safe number parsing
 */
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Safe string access
 */
export function safeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

/**
 * Safe date parsing
 */
export function safeDate(value: unknown): Date | null {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe localStorage access
 */
export function safeLocalStorage(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe localStorage write
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe object access with default
 */
export function safeObject<T extends object>(obj: T | null | undefined, defaultValue: T): T {
  return obj !== null && obj !== undefined && typeof obj === 'object' ? obj : defaultValue;
}
