const isProduction = process.env.NODE_ENV === "production";

const write = (level, message, meta) => {
  const payload = {
    level,
    message,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
};

const logger = {
  debug(message, meta) {
    if (!isProduction) {
      write("debug", message, meta);
    }
  },
  info(message, meta) {
    write("info", message, meta);
  },
  warn(message, meta) {
    write("warn", message, meta);
  },
  error(message, meta) {
    write("error", message, meta);
  },
};

module.exports = logger;
