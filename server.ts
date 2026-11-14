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

// Pencatat aktivitas permintaan ke jalur API
app.use((req, _res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${req.method}] ${req.url}`);
  }
  next();
});

// Melayani unduhan berkas panduan pengujian sistem jika diakses langsung
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

// Mendaftarkan seluruh rute REST API pada jalur /api
app.use('/api', apiRouter);

// Penanganan rute /api yang tidak ditemukan agar selalu mengembalikan format JSON
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint API ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// Penanganan kesalahan terpusat khusus permintaan API
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api')) {
    console.error('Kesalahan API:', err);
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
    console.log(`Server SILAMAS berjalan pada http://0.0.0.0:${PORT}`);
  });
}

// Menjalankan server lokal/mandiri apabila tidak berjalan di lingkungan serverless Vercel
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Gagal menjalankan server:', err);
    process.exit(1);
  });
}

export default app;
