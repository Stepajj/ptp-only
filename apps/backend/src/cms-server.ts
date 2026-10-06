import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { cmsRouter } from './modules/cms/cms.routes';
import { connectDatabase, disconnectDatabase } from './db/prisma';

const app = express();
const allowedOrigin = process.env.CMS_FRONTEND_ORIGIN ?? 'http://localhost:3000';
app.disable('x-powered-by');
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cache-Control', 'no-store');
  if (request.headers.origin === allowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Vary', 'Origin');
  }
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.status(204).end(); return;
  }
  next();
});
app.use(express.json({ limit: '1mb', type: 'application/json' }));
app.use('/cms', cmsRouter);
app.use((_request, response) => response.status(404).json({ error: 'NOT_FOUND' }));

const port = Number(process.env.CMS_PORT ?? 4010);
const server = createServer(app);
void connectDatabase().then(() => server.listen(port, '127.0.0.1', () => {
  console.info(`Local content service listening on http://127.0.0.1:${String(port)}`);
})).catch((error: unknown) => { console.error('Content service failed to start', error); process.exitCode = 1; });
async function stop() { server.close(); await disconnectDatabase(); process.exit(0); }
process.on('SIGINT', () => { void stop(); });
process.on('SIGTERM', () => { void stop(); });
