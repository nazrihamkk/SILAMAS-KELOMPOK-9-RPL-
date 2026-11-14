/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { authenticate, generateToken, requireRole, AuthRequest } from './auth.js';
import { StatusPengajuan } from './types.js';

export const apiRouter = express.Router();

function validateCoordinates(latRaw: any, lngRaw: any): { valid: boolean; lat: number; lng: number; message?: string } {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  if (latRaw === undefined || lngRaw === undefined || latRaw === '' || lngRaw === '' || isNaN(lat) || isNaN(lng)) {
    return {
      valid: false,
      lat: 0,
      lng: 0,
      message: 'Koordinat lokasi (Latitude dan Longitude) wajib diisi dengan angka yang valid.',
    };
  }

  // Deteksi koordinat tertukar (misalnya nilai Latitude diisi 119.87 dan Longitude diisi -0.90)
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    return {
      valid: false,
      lat,
      lng,
      message: `Koordinat Latitude (${lat}) dan Longitude (${lng}) terdeteksi tertukar! Latitude harus berada pada rentang -90 s/d 90 (contoh: -0.901407) dan Longitude pada rentang -180 s/d 180 (contoh: 119.874548).`,
    };
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return {
      valid: false,
      lat,
      lng,
      message: 'Nilai koordinat berada di luar batas geografis bumi (Latitude: -90 s/d 90, Longitude: -180 s/d 180).',
    };
  }

  // Periksa kemungkinan koordinat lintang dan bujur wilayah Indonesia yang tertukar
  if (lat > 50 && lng < 50) {
    return {
      valid: false,
      lat,
      lng,
      message: `Koordinat Latitude (${lat}) dan Longitude (${lng}) kemungkinan tertukar. Mohon periksa kembali titik lokasi pada peta.`,
    };
  }

  return { valid: true, lat, lng };
}

// ==========================================
// 1. AUTENTIKASI & PROFIL PENGGUNA
// ==========================================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: 'Username dan kata sandi wajib diisi.',
    });
    return;
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Username atau kata sandi yang Anda masukkan salah.',
    });
    return;
  }

  if (user.status_akun !== 'Aktif') {
    res.status(403).json({
      success: false,
      message: 'Akun Anda sedang dinonaktifkan oleh administrator.',
    });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Username atau kata sandi yang Anda masukkan salah.',
    });
    return;
  }

  const token = generateToken(user);
  const masjid = user.id_masjid ? db.getMasjidById(user.id_masjid) : null;

  res.json({
    success: true,
    message: 'Berhasil masuk ke sistem SILAMAS.',
    data: {
      token,
      user: {
        id_user: user.id_user,
        nama: user.nama,
        username: user.username,
        role: user.role,
        id_masjid: user.id_masjid,
        nama_masjid: masjid ? masjid.nama_masjid : null,
      },
    },
  });
});

apiRouter.get('/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
    return;
  }

  const user = db.findUserById(req.user.id_user);
  if (!user) {
    res.status(404).json({ success: false, message: 'Data pengguna tidak ditemukan' });
    return;
  }

  const masjid = user.id_masjid ? db.getMasjidById(user.id_masjid) : null;

  res.json({
    success: true,
    message: 'Data sesi pengguna aktif.',
    data: {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role: user.role,
      id_masjid: user.id_masjid,
      nama_masjid: masjid ? masjid.nama_masjid : null,
      status_akun: user.status_akun,
    },
  });
});

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Layanan backend SILAMAS aktif.',
    data: {
      status: 'ok',
      totalMasjid: db.listMasjids().length,
    },
  });
});

apiRouter.post('/sync', authenticate, (req: AuthRequest, res: Response) => {
  const snapshot = req.body;
  if (snapshot && typeof snapshot === 'object') {
    db.syncState(snapshot);
  }
  res.json({
    success: true,
    message: 'Sinkronisasi data berhasil.',
  });
});

apiRouter.post('/seed/reset', (req: Request, res: Response) => {
  db.resetToSeed();
  res.json({
    success: true,
    message: 'Basis data berhasil dikembalikan ke 10 data masjid terverifikasi awal.',
  });
});

// ==========================================
// 2. DASHBOARD & STATISTIK
// ==========================================
apiRouter.get('/stats', (req: Request, res: Response) => {
  const masjidId = typeof req.query.masjid_id === 'string' ? req.query.masjid_id : undefined;
  const stats = db.getDashboardStats(masjidId);
  res.json({
    success: true,
    message: 'Data ringkasan statistik berhasil dimuat.',
    data: stats,
  });
});

// ==========================================
// 3. MASTER MASJID (/api/masjids & /api/masjid)
// ==========================================
apiRouter.get(['/masjids', '/masjid'], (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const kelurahan = typeof req.query.kelurahan === 'string' ? req.query.kelurahan : undefined;
  const data = db.listMasjids({ q, kelurahan });

  res.json({
    success: true,
    message: 'Daftar masjid berhasil dimuat.',
    data,
  });
});

apiRouter.get(['/masjids/:id', '/masjid/:id'], (req: Request, res: Response) => {
  const { id } = req.params;
  const masjid = db.getMasjidById(id);
  if (!masjid) {
    res.status(404).json({
      success: false,
      message: `Masjid dengan kode ${id} tidak ditemukan.`,
    });
    return;
  }

  const fasilitas = db.listFasilitas({ id_masjid: id });
  const pengurus = db.listPengurus({ id_masjid: id });
  const kegiatan = db.listKegiatan({ id_masjid: id });
  const pengumuman = db.listPengumuman({ id_masjid: id });

  res.json({
    success: true,
    message: 'Detail informasi masjid berhasil dimuat.',
    data: {
      ...masjid,
      fasilitas,
      pengurus,
      kegiatan,
      pengumuman,
    },
  });
});

apiRouter.post(['/masjids', '/masjid'], authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const {
    nama_masjid,
    alamat,
    kelurahan,
    kecamatan,
    latitude,
    longitude,
    kapasitas,
    kapasitas_teks,
    fasilitas_ringkas,
    nama_pengurus_utama,
    tahun_berdiri,
    deskripsi,
    telepon,
    email,
    luas_tanah,
    status_tanah,
    foto_url,
    kata_kunci_foto_google,
    status_foto,
    sumber_data,
    catatan_verifikasi,
    skor_rekomendasi,
    status_verifikasi,
  } = req.body;

  if (!nama_masjid || !alamat || !kelurahan) {
    res.status(400).json({
      success: false,
      message: 'Nama masjid, alamat lengkap, dan kelurahan/wilayah wajib diisi.',
    });
    return;
  }

  const coordCheck = validateCoordinates(latitude, longitude);
  if (!coordCheck.valid) {
    res.status(400).json({
      success: false,
      message: coordCheck.message,
    });
    return;
  }

  const kapasitasNum = parseInt(kapasitas, 10) || 0;
  if (kapasitasNum <= 0) {
    res.status(400).json({
      success: false,
      message: 'Kapasitas jemaah harus diisi dengan angka lebih dari 0.',
    });
    return;
  }

  const uniqueness = db.validateMasjidUniqueness({
    nama_masjid: String(nama_masjid),
    alamat: String(alamat),
    kelurahan: String(kelurahan),
    latitude: coordCheck.lat,
    longitude: coordCheck.lng,
    foto_url: foto_url ? String(foto_url) : '',
  });

  if (!uniqueness.valid) {
    res.status(409).json({
      success: false,
      message: uniqueness.message,
    });
    return;
  }

  const created = db.createMasjid({
    nama_masjid: String(nama_masjid).trim(),
    alamat: String(alamat).trim(),
    kelurahan: String(kelurahan).trim(),
    kecamatan: kecamatan ? String(kecamatan).trim() : 'Wilayah Terdaftar',
    latitude: coordCheck.lat,
    longitude: coordCheck.lng,
    kapasitas: kapasitasNum,
    kapasitas_teks: kapasitas_teks ? String(kapasitas_teks).trim() : `Sekitar ${kapasitasNum.toLocaleString('id-ID')} jemaah`,
    fasilitas_ringkas: fasilitas_ringkas ? String(fasilitas_ringkas).trim() : 'Tempat wudu; WC; pengeras suara',
    nama_pengurus_utama: nama_pengurus_utama ? String(nama_pengurus_utama).trim() : 'Belum tercatat',
    tahun_berdiri: parseInt(tahun_berdiri, 10) || new Date().getFullYear(),
    deskripsi: deskripsi ? String(deskripsi).trim() : '',
    telepon: telepon ? String(telepon).trim() : '-',
    email: email ? String(email).trim() : '',
    luas_tanah: luas_tanah ? String(luas_tanah).trim() : 'Belum tercatat',
    status_tanah: status_tanah ? String(status_tanah).trim() : 'Belum diverifikasi',
    foto_url: foto_url ? String(foto_url).trim() : '',
    kata_kunci_foto_google: kata_kunci_foto_google ? String(kata_kunci_foto_google).trim() : `${nama_masjid} ${alamat}`,
    status_foto: status_foto
      ? String(status_foto).trim()
      : foto_url
      ? 'Foto diunggah oleh administrator'
      : 'Perlu verifikasi visual pada Google Maps',
    sumber_data: sumber_data ? String(sumber_data).trim() : 'Input Administrator SILAMAS',
    catatan_verifikasi: catatan_verifikasi
      ? String(catatan_verifikasi).trim()
      : 'Titik lokasi dan data dasar telah diperiksa melalui pratinjau peta SILAMAS.',
    skor_rekomendasi: Number(skor_rekomendasi) || 9.0,
    status_verifikasi: status_verifikasi || 'Terverifikasi',
  });

  res.status(201).json({
    success: true,
    message: 'Data masjid baru berhasil diverifikasi dan disimpan ke dalam sistem.',
    data: created,
  });
});

apiRouter.put(['/masjids/:id', '/masjid/:id'], authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.role === 'pengurus' && req.user.id_masjid !== id) {
    res.status(403).json({
      success: false,
      message: 'Anda hanya memiliki izin mengelola data masjid tempat Anda bertugas.',
    });
    return;
  }

  const existing = db.getMasjidById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Data masjid tidak ditemukan.' });
    return;
  }

  const nextLat = req.body.latitude !== undefined ? req.body.latitude : existing.latitude;
  const nextLng = req.body.longitude !== undefined ? req.body.longitude : existing.longitude;

  const coordCheck = validateCoordinates(nextLat, nextLng);
  if (!coordCheck.valid) {
    res.status(400).json({
      success: false,
      message: coordCheck.message,
    });
    return;
  }

  const nextName = req.body.nama_masjid !== undefined ? String(req.body.nama_masjid) : existing.nama_masjid;
  const nextAddr = req.body.alamat !== undefined ? String(req.body.alamat) : existing.alamat;
  const nextKel = req.body.kelurahan !== undefined ? String(req.body.kelurahan) : existing.kelurahan;
  const nextPhoto = req.body.foto_url !== undefined ? String(req.body.foto_url) : existing.foto_url;

  const uniqueness = db.validateMasjidUniqueness(
    {
      nama_masjid: nextName,
      alamat: nextAddr,
      kelurahan: nextKel,
      latitude: coordCheck.lat,
      longitude: coordCheck.lng,
      foto_url: nextPhoto,
    },
    id
  );

  if (!uniqueness.valid) {
    res.status(409).json({
      success: false,
      message: uniqueness.message,
    });
    return;
  }

  const updated = db.updateMasjid(id, {
    ...req.body,
    latitude: coordCheck.lat,
    longitude: coordCheck.lng,
  });

  res.json({
    success: true,
    message: 'Data masjid berhasil diperbarui.',
    data: updated,
  });
});

apiRouter.delete(['/masjids/:id', '/masjid/:id'], authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteMasjid(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Data masjid tidak ditemukan.' });
    return;
  }

  res.json({
    success: true,
    message: 'Data masjid beserta data pendukungnya berhasil dihapus.',
  });
});

// ==========================================
// 4. FASILITAS & PERLENGKAPAN
// ==========================================
apiRouter.get('/fasilitas', (req: Request, res: Response) => {
  const id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;
  const kondisi = typeof req.query.kondisi === 'string' ? req.query.kondisi : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  const data = db.listFasilitas({ id_masjid, kondisi, q });
  res.json({
    success: true,
    message: 'Data perlengkapan dan fasilitas berhasil dimuat.',
    data,
  });
});

apiRouter.post('/fasilitas', authenticate, (req: AuthRequest, res: Response) => {
  let { id_masjid, nama_fasilitas, jumlah, kondisi, keterangan, bisa_dipinjam } = req.body;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  if (!id_masjid || !nama_fasilitas) {
    res.status(400).json({
      success: false,
      message: 'Masjid dan nama fasilitas wajib diisi.',
    });
    return;
  }

  const jumlahNum = parseInt(jumlah, 10) || 1;
  if (jumlahNum < 0) {
    res.status(400).json({
      success: false,
      message: 'Jumlah fasilitas tidak boleh kurang dari 0.',
    });
    return;
  }

  const created = db.createFasilitas({
    id_masjid,
    nama_fasilitas: String(nama_fasilitas).trim(),
    jumlah: jumlahNum,
    kondisi: kondisi || 'Baik',
    keterangan: keterangan || '',
    bisa_dipinjam: Boolean(bisa_dipinjam),
  });

  res.status(201).json({
    success: true,
    message: 'Data fasilitas berhasil ditambahkan.',
    data: created,
  });
});

apiRouter.put('/fasilitas/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getFasilitasById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Fasilitas tidak ditemukan.' });
    return;
  }

  if (req.user?.role === 'pengurus' && req.user.id_masjid !== existing.id_masjid) {
    res.status(403).json({ success: false, message: 'Akses ditolak.' });
    return;
  }

  const updated = db.updateFasilitas(id, req.body);
  res.json({
    success: true,
    message: 'Data fasilitas berhasil diperbarui.',
    data: updated,
  });
});

apiRouter.delete('/fasilitas/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getFasilitasById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Fasilitas tidak ditemukan.' });
    return;
  }

  if (req.user?.role === 'pengurus' && req.user.id_masjid !== existing.id_masjid) {
    res.status(403).json({ success: false, message: 'Akses ditolak.' });
    return;
  }

  db.deleteFasilitas(id);
  res.json({
    success: true,
    message: 'Data fasilitas berhasil dihapus.',
  });
});

// ==========================================
// 5. PENGURUS MASJID
// ==========================================
apiRouter.get('/pengurus', (req: Request, res: Response) => {
  const id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;
  const jabatan = typeof req.query.jabatan === 'string' ? req.query.jabatan : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  const data = db.listPengurus({ id_masjid, jabatan, q });
  res.json({
    success: true,
    message: 'Data pengurus masjid berhasil dimuat.',
    data,
  });
});

apiRouter.post('/pengurus', authenticate, (req: AuthRequest, res: Response) => {
  let { id_masjid, nama_pengurus, jabatan, kontak, periode, email } = req.body;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  if (!id_masjid || !nama_pengurus || !jabatan) {
    res.status(400).json({
      success: false,
      message: 'Masjid, nama pengurus, dan jabatan wajib diisi.',
    });
    return;
  }

  const created = db.createPengurus({
    id_masjid,
    nama_pengurus: String(nama_pengurus).trim(),
    jabatan: String(jabatan).trim(),
    kontak: kontak || '',
    periode: periode || '2024 - 2027',
    email: email || '',
  });

  res.status(201).json({
    success: true,
    message: 'Data pengurus masjid berhasil disimpan.',
    data: created,
  });
});

apiRouter.put('/pengurus/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getPengurusById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Data pengurus tidak ditemukan.' });
    return;
  }

  if (req.user?.role === 'pengurus' && req.user.id_masjid !== existing.id_masjid) {
    res.status(403).json({ success: false, message: 'Akses ditolak.' });
    return;
  }

  const updated = db.updatePengurus(id, req.body);
  res.json({
    success: true,
    message: 'Data pengurus berhasil diperbarui.',
    data: updated,
  });
});

apiRouter.delete('/pengurus/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getPengurusById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Data pengurus tidak ditemukan.' });
    return;
  }

  if (req.user?.role === 'pengurus' && req.user.id_masjid !== existing.id_masjid) {
    res.status(403).json({ success: false, message: 'Akses ditolak.' });
    return;
  }

  db.deletePengurus(id);
  res.json({
    success: true,
    message: 'Data pengurus berhasil dihapus.',
  });
});

// ==========================================
// 6. AGENDA KEGIATAN MASJID
// ==========================================
apiRouter.get('/kegiatan', (req: Request, res: Response) => {
  const id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  const data = db.listKegiatan({ id_masjid, status, q });
  res.json({
    success: true,
    message: 'Data kegiatan berhasil dimuat.',
    data,
  });
});

apiRouter.post('/kegiatan', authenticate, (req: AuthRequest, res: Response) => {
  let { id_masjid, nama_kegiatan, tanggal, waktu, penceramah, lokasi, keterangan, status } = req.body;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  if (!id_masjid || !nama_kegiatan || !tanggal) {
    res.status(400).json({
      success: false,
      message: 'Masjid, nama kegiatan, dan tanggal wajib diisi.',
    });
    return;
  }

  const created = db.createKegiatan({
    id_masjid,
    nama_kegiatan: String(nama_kegiatan).trim(),
    tanggal: String(tanggal).trim(),
    waktu: waktu || '05:30 WITA',
    penceramah: penceramah || '',
    lokasi: lokasi || 'Ruang Utama Masjid',
    keterangan: keterangan || '',
    status: status || 'Akan Datang',
  });

  res.status(201).json({
    success: true,
    message: 'Jadwal kegiatan berhasil ditambahkan.',
    data: created,
  });
});

apiRouter.put('/kegiatan/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updateKegiatan(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    return;
  }
  res.json({
    success: true,
    message: 'Data kegiatan berhasil diperbarui.',
    data: updated,
  });
});

apiRouter.delete('/kegiatan/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.deleteKegiatan(id);
  res.json({
    success: true,
    message: 'Data kegiatan berhasil dihapus.',
  });
});

// ==========================================
// 7. PENGUMUMAN MASJID
// ==========================================
apiRouter.get('/pengumuman', (req: Request, res: Response) => {
  const id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;
  const kategori = typeof req.query.kategori === 'string' ? req.query.kategori : undefined;

  const data = db.listPengumuman({ id_masjid, kategori });
  res.json({
    success: true,
    message: 'Pengumuman berhasil dimuat.',
    data,
  });
});

apiRouter.post('/pengumuman', authenticate, (req: AuthRequest, res: Response) => {
  let { id_masjid, judul, isi, tanggal, penulis, kategori } = req.body;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  if (!id_masjid || !judul || !isi) {
    res.status(400).json({
      success: false,
      message: 'Masjid, judul, dan isi pengumuman wajib diisi.',
    });
    return;
  }

  const created = db.createPengumuman({
    id_masjid,
    judul: String(judul).trim(),
    isi: String(isi).trim(),
    tanggal: tanggal || new Date().toISOString().split('T')[0],
    penulis: penulis || (req.user?.nama || 'Pengurus Masjid'),
    kategori: kategori || 'Umum',
  });

  res.status(201).json({
    success: true,
    message: 'Pengumuman baru berhasil diterbitkan.',
    data: created,
  });
});

apiRouter.put('/pengumuman/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updatePengumuman(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan.' });
    return;
  }
  res.json({
    success: true,
    message: 'Pengumuman berhasil diperbarui.',
    data: updated,
  });
});

apiRouter.delete('/pengumuman/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.deletePengumuman(id);
  res.json({
    success: true,
    message: 'Pengumuman berhasil dihapus.',
  });
});

// ==========================================
// 8. PEMINJAMAN FASILITAS
// ==========================================
apiRouter.get('/peminjaman', authenticate, (req: AuthRequest, res: Response) => {
  let id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  const data = db.listPeminjaman({ id_masjid, status, q });
  res.json({
    success: true,
    message: 'Daftar permohonan peminjaman fasilitas berhasil dimuat.',
    data,
  });
});

apiRouter.post('/peminjaman', (req: Request, res: Response) => {
  const {
    id_masjid,
    id_fasilitas,
    nama_pemohon,
    nik_pemohon,
    kontak_pemohon,
    email_pemohon,
    alamat_pemohon,
    tanggal_mulai,
    tanggal_selesai,
    waktu_mulai,
    waktu_selesai,
    tujuan_peminjaman,
  } = req.body;

  if (!id_masjid || !id_fasilitas || !nama_pemohon || !kontak_pemohon || !tanggal_mulai || !tujuan_peminjaman) {
    res.status(400).json({
      success: false,
      message: 'Formulir belum lengkap. Pastikan nama pemohon, nomor telepon/WA, tanggal, dan tujuan peminjaman telah diisi.',
    });
    return;
  }

  const created = db.createPeminjaman({
    id_masjid,
    id_fasilitas,
    nama_pemohon: String(nama_pemohon).trim(),
    nik_pemohon: String(nik_pemohon || '').trim(),
    kontak_pemohon: String(kontak_pemohon).trim(),
    email_pemohon: String(email_pemohon || '').trim(),
    alamat_pemohon: String(alamat_pemohon || '').trim(),
    tanggal_mulai,
    tanggal_selesai: tanggal_selesai || tanggal_mulai,
    waktu_mulai: waktu_mulai || '08:00 WITA',
    waktu_selesai: waktu_selesai || '12:00 WITA',
    tujuan_peminjaman: String(tujuan_peminjaman).trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Permohonan peminjaman berhasil diajukan! Simpan kode pengajuan Anda.',
    data: created,
  });
});

apiRouter.get('/peminjaman/track/:kode', (req: Request, res: Response) => {
  const { kode } = req.params;
  const result = db.getPeminjamanByKode(kode);

  if (!result) {
    res.status(404).json({
      success: false,
      message: `Data peminjaman dengan kode pengajuan "${kode}" tidak ditemukan. Pastikan kode yang dimasukkan sudah benar.`,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Data pengajuan peminjaman ditemukan.',
    data: result,
  });
});

apiRouter.put('/peminjaman/:id/status', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, catatan } = req.body as { status: StatusPengajuan; catatan: string };

  if (!status) {
    res.status(400).json({
      success: false,
      message: 'Status peminjaman wajib dipilih.',
    });
    return;
  }

  const officerName = req.user?.nama || 'Pengurus Masjid';
  const updated = db.updateStatusPeminjaman(id, status, catatan || `Status diperbarui menjadi ${status}`, officerName);

  if (!updated) {
    res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
    return;
  }

  res.json({
    success: true,
    message: `Status peminjaman berhasil diperbarui menjadi "${status}".`,
    data: updated,
  });
});

// ==========================================
// 9. LAYANAN JEMAAH
// ==========================================
apiRouter.get('/layanan', authenticate, (req: AuthRequest, res: Response) => {
  let id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  const data = db.listLayanan({ id_masjid, status, q });
  res.json({
    success: true,
    message: 'Daftar permohonan layanan jemaah berhasil dimuat.',
    data,
  });
});

apiRouter.post('/layanan', (req: Request, res: Response) => {
  const { id_masjid, jenis_layanan, nama_pemohon, nik_pemohon, kontak_pemohon, alamat_pemohon, rincian_kebutuhan } = req.body;

  if (!id_masjid || !jenis_layanan || !nama_pemohon || !kontak_pemohon || !rincian_kebutuhan) {
    res.status(400).json({
      success: false,
      message: 'Formulir belum lengkap. Masjid tujuan, jenis layanan, nama pemohon, nomor telepon/WA, dan rincian kebutuhan wajib diisi.',
    });
    return;
  }

  const created = db.createLayanan({
    id_masjid,
    jenis_layanan: String(jenis_layanan).trim(),
    nama_pemohon: String(nama_pemohon).trim(),
    nik_pemohon: nik_pemohon ? String(nik_pemohon).trim() : '',
    kontak_pemohon: String(kontak_pemohon).trim(),
    alamat_pemohon: alamat_pemohon ? String(alamat_pemohon).trim() : '',
    rincian_kebutuhan: String(rincian_kebutuhan).trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Permohonan layanan jemaah berhasil diajukan! Simpan kode pengajuan Anda.',
    data: created,
  });
});

apiRouter.get('/layanan/track/:kode', (req: Request, res: Response) => {
  const { kode } = req.params;
  const result = db.getLayananByKode(kode);

  if (!result) {
    res.status(404).json({
      success: false,
      message: `Data permohonan layanan dengan kode pengajuan "${kode}" tidak ditemukan.`,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Data pengajuan layanan ditemukan.',
    data: result,
  });
});

apiRouter.put('/layanan/:id/status', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, catatan } = req.body as { status: StatusPengajuan; catatan: string };

  if (!status) {
    res.status(400).json({
      success: false,
      message: 'Status layanan wajib dipilih.',
    });
    return;
  }

  const officerName = req.user?.nama || 'Pengurus Masjid';
  const updated = db.updateStatusLayanan(id, status, catatan || `Status diperbarui menjadi ${status}`, officerName);

  if (!updated) {
    res.status(404).json({ success: false, message: 'Permohonan layanan tidak ditemukan.' });
    return;
  }

  res.json({
    success: true,
    message: `Status layanan berhasil diperbarui menjadi "${status}".`,
    data: updated,
  });
});

// ==========================================
// 10. PUSAT RINGKASAN DATA SILAMAS
// ==========================================
apiRouter.get('/laporan/rekap', authenticate, (req: AuthRequest, res: Response) => {
  let id_masjid = typeof req.query.id_masjid === 'string' ? req.query.id_masjid : undefined;

  if (req.user?.role === 'pengurus' && req.user.id_masjid) {
    id_masjid = req.user.id_masjid;
  }

  const masjids = id_masjid ? [db.getMasjidById(id_masjid)].filter(Boolean) : db.listMasjids();
  const fasilitas = db.listFasilitas({ id_masjid });
  const pengurus = db.listPengurus({ id_masjid });
  const kegiatan = db.listKegiatan({ id_masjid });
  const peminjaman = db.listPeminjaman({ id_masjid });
  const layanan = db.listLayanan({ id_masjid });

  res.json({
    success: true,
    message: 'Ringkasan data SILAMAS siap ditampilkan.',
    data: {
      generated_at: new Date().toISOString(),
      user: req.user,
      masjids,
      fasilitas,
      pengurus,
      kegiatan,
      peminjaman,
      layanan,
    },
  });
});

// ==========================================
// 11. MANAJEMEN AKUN PENGGUNA (KHUSUS ADMIN)
// ==========================================
apiRouter.get('/users', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const users = db.listUsers();
  res.json({
    success: true,
    message: 'Daftar akun pengguna berhasil dimuat.',
    data: users,
  });
});

apiRouter.post('/users', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { nama, username, password, role, id_masjid } = req.body;

  if (!nama || !username || !password || !role) {
    res.status(400).json({
      success: false,
      message: 'Nama, username, kata sandi, dan peran wajib diisi.',
    });
    return;
  }

  const existing = db.findUserByUsername(username);
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'Username sudah digunakan oleh akun lain.',
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const count = db.listUsers().length + 1;
  const now = new Date().toISOString();

  const newUser = db.createUser({
    id_user: `USR-${String(count).padStart(3, '0')}`,
    nama: String(nama).trim(),
    username: String(username).toLowerCase().trim(),
    password_hash,
    role,
    id_masjid: role === 'pengurus' ? id_masjid : null,
    status_akun: 'Aktif',
    created_at: now,
    updated_at: now,
  });

  const { password_hash: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    message: 'Akun pengguna baru berhasil ditambahkan.',
    data: safeUser,
  });
});

apiRouter.put('/users/:id', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nama, status_akun, role, id_masjid, password } = req.body;

  const updates: any = {};
  if (nama) updates.nama = nama;
  if (status_akun) updates.status_akun = status_akun;
  if (role) updates.role = role;
  if (id_masjid !== undefined) updates.id_masjid = id_masjid;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    updates.password_hash = bcrypt.hashSync(password, salt);
  }

  const updated = db.updateUser(id, updates);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    return;
  }

  const { password_hash: _, ...safeUser } = updated;
  res.json({
    success: true,
    message: 'Data akun pengguna berhasil diperbarui.',
    data: safeUser,
  });
});

apiRouter.delete('/users/:id', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user?.id_user) {
    res.status(400).json({
      success: false,
      message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.',
    });
    return;
  }

  const deleted = db.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    return;
  }

  res.json({
    success: true,
    message: 'Akun pengguna berhasil dihapus.',
  });
});
