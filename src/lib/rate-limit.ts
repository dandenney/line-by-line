// Rate limiting utility for auth endpoints
// Note: Supabase already provides rate limiting, this is additional protection

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return false;
  }
  
  rateLimitStore[key].count++;
  return true;
}

export function getRateLimitRemaining(identifier: string): number {
  const key = `rate_limit_${identifier}`;
  const entry = rateLimitStore[key];
  
  if (!entry || Date.now() > entry.resetTime) {
    return 5; // Default max requests
  }
  
  return Math.max(0, 5 - entry.count);
} 