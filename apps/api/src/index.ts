import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';

const app = new Hono();

// 🔱 Global Middleware
app.use('*', requestId());
app.use('*', async (c, next) => {
  const reqId = c.get('requestId');
  logger.info({ 
    requestId: reqId,
    method: c.req.method, 
    url: c.req.url 
  }, '📩 Incoming Request');
  await next();
});

// 🔱 Health Check
app.get('/ping', (c) => {
  return c.json({ 
    success: true, 
    message: 'pong',
    requestId: c.get('requestId')
  });
});

// 🔱 Global Error Catch
app.onError(errorHandler);

export default app;
