// Tiny in-memory rate limiter factory (no extra deps). Good enough for a single
// instance; use a shared store (e.g. Redis) when scaling horizontally.
const createRateLimiter = ({ windowMs = 60 * 1000, max = 200, message } = {}) => {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
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
