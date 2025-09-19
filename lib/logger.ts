import pino from 'pino';

// Create logger configuration based on environment
const createLogger = () => {
  const baseConfig = {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['req.headers.authorization', 'ip'],
      censor: '[REDACTED]'
    }
  };

  // In development, try to use pino-pretty if available, otherwise use default
  if (process.env.NODE_ENV === 'development') {
    try {
      return pino({
        ...baseConfig,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' }
        }
      });
    } catch (error) {
      // Fallback to default logger if pino-pretty is not available
      console.warn('pino-pretty not available, using default logger');
      return pino(baseConfig);
    }
  }
  
  // Production logger
  return pino(baseConfig);
};

export const logger = createLogger();

export function withRequest(requestId?: string) {
  return requestId ? logger.child({ requestId }) : logger;
}

export function logSubmission(event: string, meta: Record<string, any>, requestId?: string) {
  try {
    withRequest(requestId).info({ event, ...meta }, 'submission_event');
  } catch (error) {
    // Fallback to console if logger fails
    console.log(`[${event}]`, meta);
  }
}