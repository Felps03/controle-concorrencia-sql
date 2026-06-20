const LEVELS = { debug: 20, info: 30, error: 50 };

const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

const serializeError = (err) => ({
  name: err.name,
  message: err.message,
  stack: err.stack,
});

const log = (level, fields, msg) => {
  if (LEVELS[level] < currentLevel) return;

  const safeFields = fields && fields.err instanceof Error
    ? { ...fields, err: serializeError(fields.err) }
    : fields;

  const line = { level, time: Date.now(), msg, ...safeFields };
  const write = level === "error" ? console.error : console.log;
  write(JSON.stringify(line));
};

module.exports = {
  debug: (fields, msg) => log("debug", fields, msg),
  info: (fields, msg) => log("info", fields, msg),
  error: (fields, msg) => log("error", fields, msg),
};
