const parseAllowedOrigins = ({ allowLocalFallback = true } = {}) => {
  const rawOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "";
  const parsed = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (parsed.length > 0 || !allowLocalFallback) return parsed;
  return ["http://localhost:3000"];
};

const isOriginAllowed = (origin, allowedOrigins) =>
  !origin || allowedOrigins.includes(origin);

module.exports = { parseAllowedOrigins, isOriginAllowed };
