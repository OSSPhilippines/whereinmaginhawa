/**
 * Strip HTML tags and dangerous content from user input strings.
 * Use this for text fields that should never contain HTML.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Sanitize an object's string values recursively.
 * Strips HTML from all string fields.
 */
export function sanitizeStrings<T>(obj: T): T {
  if (typeof obj === 'string') return stripHtml(obj) as T;
  if (Array.isArray(obj)) return obj.map(sanitizeStrings) as T;
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeStrings(value);
    }
    return result as T;
  }
  return obj;
}
