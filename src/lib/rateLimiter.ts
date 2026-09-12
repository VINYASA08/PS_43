// Sliding Window Rate Limiter for Jharkhand Smart Study and Innovation Portal
// Enforces max 10 requests per minute per IP on authentication & sensitive endpoints

interface RateLimitRecord {
  timestamps: number[];
}

const windowMs = 60 * 1000; // 1 minute sliding window
const maxRequestsPerWindow = 10; // 10 requests per minute
const ipStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 30 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  ip: string,
  maxRequests = maxRequestsPerWindow,
  customWindowMs = windowMs
): RateLimitResult {
  const now = Date.now();
  const record = ipStore.get(ip) || { timestamps: [] };

  // Keep only timestamps within window
  record.timestamps = record.timestamps.filter((ts) => now - ts < customWindowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((customWindowMs - (now - oldest)) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  ipStore.set(ip, record);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

export default checkRateLimit;
