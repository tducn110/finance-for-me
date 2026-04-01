import { Context, Next } from 'hono';
import { logger } from '../lib/logger';

export const errorHandler = async (err: any, c: Context) => {
  const requestId = c.get('requestId') || 'unknown';
  const status = err.status || 500;
  
  logger.error({
    requestId,
    method: c.req.method,
    url: c.req.url,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  }, '?? Global Error Caught');

  return c.json({
    success: false,
    requestId,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
  }, status);
};
