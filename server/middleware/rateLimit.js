// Tiny in-memory rate limiter factory (no extra deps). Good enough for a single
// instance; use a shared store (e.g. Redis) when scaling horizontally.
const createRateLimiter = ({ windowMs = 60 * 1000, max = 200, message } = {}) => {
  const hits = new Map();
  let nextSweep = Date.now() + windowMs;
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    // Drop expired entries, or the map keeps one row per IP seen, forever.
    // ponytail: a full sweep on a timer; fine at this size, swap for a Redis
    // store (which expires keys itself) when running more than one instance.
    if (now > nextSweep) {
      for (const [ip, e] of hits) if (now > e.reset) hits.delete(ip);
      nextSweep = now + windowMs;
    }

    const entry = hits.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests, please slow down',
      });
    }
    next();
  };
};

module.exports = { createRateLimiter };
