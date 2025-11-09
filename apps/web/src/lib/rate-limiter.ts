/**
 * Simple in-memory rate limiter
 *
 * NOTE: This is suitable for small-scale applications but has limitations:
 * - Resets on server restart/deployment
 * - Not shared across serverless instances in production
 * - Memory usage grows with unique identifiers
 *
 * For production at scale, consider upgrading to Redis-based rate limiting
 * (Upstash, Vercel KV, or similar)
 */

interface RateLimitConfig {
  limit: number; // Maximum requests
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 5, // 5 requests
  windowMs: 60 * 60 * 1000, // per hour
};

class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(identifier: string, config: RateLimitConfig = DEFAULT_CONFIG): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Filter out old requests outside the time window
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < config.windowMs
    );

    if (recentRequests.length >= config.limit) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Clean up old entries periodically (every 1000 unique identifiers)
    if (this.requests.size > 1000) {
      this.cleanup(config.windowMs);
    }

    return true;
  }

  private cleanup(windowMs: number) {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < windowMs
      );
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }

  /**
   * Reset rate limit for an identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new InMemoryRateLimiter();

/**
 * Check if a request is within rate limits
 * Returns true if allowed, false if rate limit exceeded
 */
export function checkRateLimit(
  identifier: string,
  config?: RateLimitConfig
): boolean {
  return rateLimiter.check(identifier, config);
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimiter.reset(identifier);
}

/**
 * Clear all rate limit data
 */
export function clearAllRateLimits(): void {
  rateLimiter.clear();
}
