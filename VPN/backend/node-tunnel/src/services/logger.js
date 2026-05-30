const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const level = LEVELS[LOG_LEVEL] !== undefined ? LEVELS[LOG_LEVEL] : 2;

function formatMessage(levelName, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${levelName.toUpperCase()}] ${message}`;
}

const logger = {
  error(message) {
    if (level >= 0) console.error(formatMessage('error', message));
  },
  warn(message) {
    if (level >= 1) console.warn(formatMessage('warn', message));
  },
  info(message) {
    if (level >= 2) console.log(formatMessage('info', message));
  },
  debug(message) {
    if (level >= 3) console.log(formatMessage('debug', message));
  },
};

module.exports = logger;
