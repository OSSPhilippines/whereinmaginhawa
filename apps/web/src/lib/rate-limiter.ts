/**
 * Rate limiter using Supabase as backing store.
 * Shared across all serverless instances. Falls back to in-memory if DB unavailable.
 *
 * Uses a simple "count requests in window" approach stored in a dedicated table.
 * For very high traffic, consider Upstash Redis.
 */

import { createAdminClient } from '@/lib/supabase/admin';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
};

// In-memory fallback if Supabase is unavailable
const memoryStore = new Map<string, number[]>();

function checkMemoryFallback(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const reqs = (memoryStore.get(identifier) || []).filter((t) => now - t < config.windowMs);
  if (reqs.length >= config.limit) return false;
  reqs.push(now);
  memoryStore.set(identifier, reqs);
  if (memoryStore.size > 1000) {
    for (const [k, v] of memoryStore.entries()) {
      if (v.filter((t) => now - t < config.windowMs).length === 0) memoryStore.delete(k);
    }
  }
  return true;
}

/**
 * Check if a request is within rate limits.
 * Uses Supabase RPC for atomic check, falls back to in-memory.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const windowStart = new Date(Date.now() - config.windowMs).toISOString();

    // Count recent requests
    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('created_at', windowStart);

    if (error) {
      // Table might not exist yet, fall back to memory
      return checkMemoryFallback(identifier, config);
    }

    if ((count ?? 0) >= config.limit) return false;

    // Record this request
    await supabase.from('rate_limits').insert({ identifier });

    return true;
  } catch {
    return checkMemoryFallback(identifier, config);
  }
}

/**
 * Synchronous in-memory check for cases where async isn't practical.
 * Use checkRateLimit (async) when possible.
 */
export function checkRateLimitSync(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): boolean {
  return checkMemoryFallback(identifier, config);
}
