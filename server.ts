/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for API routes
app.use((req, _res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${req.method}] ${req.url}`);
  }
  next();
});

// Serve SILAMAS_DATA_DEMO_PENGUJIAN.txt directly if requested
app.get('/SILAMAS_DATA_DEMO_PENGUJIAN.txt', (_req, res) => {
  const candidates = [
    path.resolve(process.cwd(), 'public', 'SILAMAS_DATA_DEMO_PENGUJIAN.txt'),
    path.resolve(process.cwd(), 'SILAMAS_DATA_DEMO_PENGUJIAN.txt'),
    path.resolve(__dirname, 'public', 'SILAMAS_DATA_DEMO_PENGUJIAN.txt'),
    path.resolve(__dirname, 'SILAMAS_DATA_DEMO_PENGUJIAN.txt'),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(filePath);
      return;
    }
  }
  res.status(404).send('File data demo pengujian tidak ditemukan.');
});

// Mount REST API routes under /api
app.use('/api', apiRouter);

// Catch-all JSON 404 for unmatched /api/* routes so frontend never receives HTML/text on /api
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint API ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// Global JSON error handler for API requests
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api')) {
    console.error('API Error:', err);
    res.status(err?.status || 500).json({
      success: false,
      message: err?.message || 'Terjadi kesalahan internal pada server SILAMAS.',
    });
    return;
  }
  next(err);
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SILAMAS Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start listening on a port when not running inside Vercel Serverless Functions
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
