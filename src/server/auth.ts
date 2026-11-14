import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from './types.js';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'silamas_palu_timur_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id_user: string;
    username: string;
    role: UserRole;
    id_masjid?: string | null;
    nama: string;
  };
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
      id_masjid: user.id_masjid,
      nama: user.nama,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id_user: string;
      username: string;
      role: UserRole;
      id_masjid?: string | null;
      nama: string;
    };

    const user = db.findUserById(decoded.id_user);
    if (!user || user.status_akun !== 'Aktif') {
      res.status(403).json({
        success: false,
        message: 'Akun Anda tidak aktif atau tidak ditemukan dalam sistem.',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan login kembali.',
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Otorisasi gagal. Anda belum login.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Akses dibatasi. Anda tidak memiliki izin untuk mengakses fitur ini.',
      });
      return;
    }

    next();
  };
}
