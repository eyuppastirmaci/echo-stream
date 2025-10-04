export const LOGGING_CONFIG = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  NODE_ENV: process.env.NODE_ENV,
  PINO_PRETTY_TARGET: 'pino-pretty',
  PINO_OPTIONS: {
    colorize: true,
    translateTime: 'SYS:standard',
    singleLine: true,
  },
  REDACT_FIELDS: ['req.headers.authorization'],
};