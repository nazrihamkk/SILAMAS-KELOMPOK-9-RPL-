/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import bcrypt from 'bcryptjs';
import { getInitialSeedData } from '../server/seedData.js';
import {
  DatabaseSchema,
  Masjid,
  Fasilitas,
  Pengurus,
  Kegiatan,
  Pengumuman,
  Peminjaman,
  LayananJemaah,
  RiwayatStatus,
  User,
} from '../server/types.js';
import {
  UserProfile,
  MasjidItem,
  FasilitasItem,
  PengurusItem,
  KegiatanItem,
  PengumumanItem,
  PeminjamanItem,
  LayananItem,
  DashboardStats,
  StatusPengajuan,
} from '../types/index.js';

const STORAGE_KEY = 'silamas_production_store_v2';

function loadStore(): DatabaseSchema {
  const seed = getInitialSeedData();
  if (typeof window === 'undefined' || !window.localStorage) {
    return seed;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    if (
      parsed.schema_version !== 2 ||
      !Array.isArray(parsed.masjids) ||
      parsed.masjids.length === 0 ||
      parsed.masjids[0].latitude === undefined
    ) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    // Pastikan akun bawaan selalu tersedia
    const users = Array.isArray(parsed.users) && parsed.users.length > 0 ? [...parsed.users] : [...seed.users];
    for (const su of seed.users) {
      if (!users.some((u) => u.username.toLowerCase() === su.username.toLowerCase())) {
        users.push(su);
      }
    }

    return {
      schema_version: 2,
      users,
      masjids: parsed.masjids,
      fasilitas: Array.isArray(parsed.fasilitas) && parsed.fasilitas.length > 0 ? parsed.fasilitas : seed.fasilitas,
      pengurus: Array.isArray(parsed.pengurus) && parsed.pengurus.length > 0 ? parsed.pengurus : seed.pengurus,
      kegiatan: Array.isArray(parsed.kegiatan) && parsed.kegiatan.length > 0 ? parsed.kegiatan : seed.kegiatan,
      pengumuman: Array.isArray(parsed.pengumuman) && parsed.pengumuman.length > 0 ? parsed.pengumuman : seed.pengumuman,
      peminjaman: Array.isArray(parsed.peminjaman) && parsed.peminjaman.length > 0 ? parsed.peminjaman : seed.peminjaman,
      layanan: Array.isArray(parsed.layanan) && parsed.layanan.length > 0 ? parsed.layanan : seed.layanan,
      riwayat: Array.isArray(parsed.riwayat) && parsed.riwayat.length > 0 ? parsed.riwayat : seed.riwayat,
    };
  } catch {
    return seed;
  }
}

function saveStore(data: DatabaseSchema): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan jika kapasitas penyimpanan browser penuh
  }
}

let activeUserSession: UserProfile | null = null;

export const localStore = {
  getState(): DatabaseSchema {
    return loadStore();
  },

  hasCustomModifications(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem('silamas_has_custom_changes') === 'true';
  },

  markModified(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('silamas_has_custom_changes', 'true');
    }
  },

  resetToSeed(): DatabaseSchema {
    const seed = getInitialSeedData();
    saveStore(seed);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('silamas_has_custom_changes');
    }
    return seed;
  },

  setSessionUser(user: UserProfile | null) {
    activeUserSession = user;
  },

  getSessionUser(): UserProfile | null {
    return activeUserSession;
  },

  // ===== AUTENTIKASI =====
  login(username: string, password: string): { token: string; user: UserProfile } {
    const data = loadStore();
    if (!username || !password) {
      throw new Error('Username dan kata sandi wajib diisi.');
    }

    const user = data.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      throw new Error('Username atau kata sandi yang Anda masukkan salah.');
    }

    if (user.status_akun !== 'Aktif') {
      throw new Error('Akun Anda sedang dinonaktifkan oleh administrator.');
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Username atau kata sandi yang Anda masukkan salah.');
    }

    const masjid = user.id_masjid ? data.masjids.find((m) => m.id_masjid === user.id_masjid) : null;
    const profile: UserProfile = {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role: user.role,
      id_masjid: user.id_masjid || null,
      nama_masjid: masjid ? masjid.nama_masjid : null,
      status_akun: user.status_akun,
    };

    activeUserSession = profile;
    const token = `silamas_tok_${btoa(encodeURIComponent(JSON.stringify(profile)))}`;
    return { token, user: profile };
  },

  getMe(token?: string | null): UserProfile {
    if (activeUserSession) return activeUserSession;
    if (token && token.startsWith('silamas_tok_')) {
      try {
        const raw = decodeURIComponent(atob(token.replace('silamas_tok_', '')));
        const parsed = JSON.parse(raw) as UserProfile;
        activeUserSession = parsed;
        return parsed;
      } catch {
        // Format token tidak sesuai
      }
    }
    throw new Error('Sesi pengguna tidak aktif.');
  },

  // ===== STATISTIK =====
  getStats(masjidId?: string): DashboardStats {
    const data = loadStore();
    const masjids = data.masjids;
    let filteredFasilitas = data.fasilitas;
    let filteredKegiatan = data.kegiatan;
    let filteredPeminjaman = data.peminjaman;
    let filteredLayanan = data.layanan;

    if (masjidId) {
      filteredFasilitas = filteredFasilitas.filter((f) => f.id_masjid === masjidId);
      filteredKegiatan = filteredKegiatan.filter((k) => k.id_masjid === masjidId);
      filteredPeminjaman = filteredPeminjaman.filter((p) => p.id_masjid === masjidId);
      filteredLayanan = filteredLayanan.filter((l) => l.id_masjid === masjidId);
    }

    const totalKapasitas = masjidId
      ? masjids.find((m) => m.id_masjid === masjidId)?.kapasitas || 0
      : masjids.reduce((sum, m) => sum + (m.kapasitas || 0), 0);

    const fasilitasKondisi = {
      baik: filteredFasilitas.filter((f) => f.kondisi === 'Baik').length,
      rusak_ringan: filteredFasilitas.filter((f) => f.kondisi === 'Rusak Ringan').length,
      rusak_berat: filteredFasilitas.filter((f) => f.kondisi === 'Rusak Berat').length,
    };

    const peminjamanStatus = {
      pending: filteredPeminjaman.filter((p) => p.status === 'Menunggu Verifikasi').length,
      disetujui: filteredPeminjaman.filter((p) => p.status === 'Disetujui').length,
      selesai: filteredPeminjaman.filter((p) => p.status === 'Selesai').length,
      ditolak: filteredPeminjaman.filter((p) => p.status === 'Ditolak').length,
    };

    const kelurahanDistribusi: Record<string, number> = {};
    masjids.forEach((m) => {
      kelurahanDistribusi[m.kelurahan] = (kelurahanDistribusi[m.kelurahan] || 0) + 1;
    });

    return {
      totalMasjid: masjids.length,
      totalKapasitas,
      totalFasilitas: filteredFasilitas.length,
      totalPengurus: masjidId
        ? data.pengurus.filter((p) => p.id_masjid === masjidId).length
        : data.pengurus.length,
      totalKegiatan: filteredKegiatan.length,
      totalPeminjaman: filteredPeminjaman.length,
      totalLayanan: filteredLayanan.length,
      pendingPeminjaman: peminjamanStatus.pending,
      pendingLayanan: filteredLayanan.filter((l) => l.status === 'Menunggu Verifikasi').length,
      fasilitasKondisi,
      peminjamanStatus,
      kelurahanDistribusi,
    };
  },

  // ===== DATA MASJID =====
  getMasjids(filter?: { q?: string; kelurahan?: string }): MasjidItem[] {
    const data = loadStore();
    let result = data.masjids;

    if (filter?.kelurahan && filter.kelurahan !== 'all' && filter.kelurahan !== 'Semua') {
      result = result.filter((m) => m.kelurahan.toLowerCase() === filter.kelurahan!.toLowerCase());
    }

    if (filter?.q) {
      const q = filter.q.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.nama_masjid.toLowerCase().includes(q) ||
          m.alamat.toLowerCase().includes(q) ||
          m.kelurahan.toLowerCase().includes(q) ||
          (m.fasilitas_ringkas && m.fasilitas_ringkas.toLowerCase().includes(q)) ||
          (m.nama_pengurus_utama && m.nama_pengurus_utama.toLowerCase().includes(q))
      );
    }

    return result.map((m) => ({
      ...m,
      total_fasilitas: data.fasilitas.filter((f) => f.id_masjid === m.id_masjid).length,
      total_pengurus: data.pengurus.filter((p) => p.id_masjid === m.id_masjid).length,
    }));
  },

  getMasjidDetail(id: string): MasjidItem {
    const data = loadStore();
    const masjid = data.masjids.find((m) => m.id_masjid === id);
    if (!masjid) {
      throw new Error(`Masjid dengan kode ${id} tidak ditemukan.`);
    }
    const fasilitas = this.getFasilitas({ id_masjid: id });
    const pengurus = this.getPengurus({ id_masjid: id });
    const kegiatan = this.getKegiatan({ id_masjid: id });
    const pengumuman = this.getPengumuman({ id_masjid: id });

    return {
      ...masjid,
      fasilitas,
      pengurus,
      kegiatan,
      pengumuman,
    };
  },

  createMasjid(payload: Partial<MasjidItem>): MasjidItem {
    const data = loadStore();
    const existingNums = data.masjids
      .map((m) => parseInt(m.id_masjid.replace('MSJ-', ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
    const newId = payload.id_masjid || `MSJ-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const kapasitasNum = Number(payload.kapasitas) || 250;

    const created: Masjid = {
      id_masjid: newId,
      nama_masjid: String(payload.nama_masjid || '').trim(),
      alamat: String(payload.alamat || '').trim(),
      kelurahan: String(payload.kelurahan || '').trim(),
      kecamatan: String(payload.kecamatan || 'Wilayah Terdaftar').trim(),
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      kapasitas: kapasitasNum,
      kapasitas_teks: payload.kapasitas_teks || `Sekitar ${kapasitasNum.toLocaleString('id-ID')} jemaah`,
      fasilitas_ringkas: payload.fasilitas_ringkas || 'Tempat wudu; WC; pengeras suara',
      nama_pengurus_utama: payload.nama_pengurus_utama || 'Belum tercatat',
      tahun_berdiri: Number(payload.tahun_berdiri) || new Date().getFullYear(),
      deskripsi: String(payload.deskripsi || '').trim(),
      telepon: String(payload.telepon || '-').trim(),
      email: String(payload.email || '').trim(),
      luas_tanah: String(payload.luas_tanah || 'Belum tercatat').trim(),
      status_tanah: String(payload.status_tanah || 'Belum diverifikasi').trim(),
      foto_url: payload.foto_url ? String(payload.foto_url).trim() : '',
      kata_kunci_foto_google: payload.kata_kunci_foto_google || `${payload.nama_masjid} ${payload.alamat}`,
      status_foto: payload.status_foto || (payload.foto_url ? 'Foto diunggah oleh administrator' : 'Belum ada foto terverifikasi'),
      sumber_data: payload.sumber_data || 'Input Administrator SILAMAS',
      catatan_verifikasi: payload.catatan_verifikasi || 'Titik lokasi dan data dasar telah diperiksa melalui pratinjau peta SILAMAS.',
      skor_rekomendasi: Number(payload.skor_rekomendasi) || 9.0,
      status_verifikasi: payload.status_verifikasi || 'Terverifikasi',
      created_at: now,
      updated_at: now,
    };

    // Perbarui jika kode masjid sudah ada saat sinkronisasi dengan respons server
    const existingIdx = data.masjids.findIndex((m) => m.id_masjid === created.id_masjid);
    if (existingIdx >= 0) {
      data.masjids[existingIdx] = created;
    } else {
      data.masjids.push(created);
    }

    saveStore(data);
    this.markModified();
    return created;
  },

  updateMasjid(id: string, updates: Partial<MasjidItem>): MasjidItem {
    const data = loadStore();
    const idx = data.masjids.findIndex((m) => m.id_masjid === id);
    if (idx === -1) {
      throw new Error('Data masjid tidak ditemukan.');
    }
    data.masjids[idx] = {
      ...data.masjids[idx],
      ...updates,
      id_masjid: id,
      latitude: updates.latitude !== undefined ? Number(updates.latitude) : data.masjids[idx].latitude,
      longitude: updates.longitude !== undefined ? Number(updates.longitude) : data.masjids[idx].longitude,
      updated_at: new Date().toISOString(),
    };
    saveStore(data);
    this.markModified();
    return data.masjids[idx];
  },

  deleteMasjid(id: string): void {
    const data = loadStore();
    data.masjids = data.masjids.filter((m) => m.id_masjid !== id);
    data.fasilitas = data.fasilitas.filter((f) => f.id_masjid !== id);
    data.pengurus = data.pengurus.filter((p) => p.id_masjid !== id);
    data.kegiatan = data.kegiatan.filter((k) => k.id_masjid !== id);
    data.pengumuman = data.pengumuman.filter((p) => p.id_masjid !== id);
    saveStore(data);
    this.markModified();
  },

  // ===== FASILITAS =====
  getFasilitas(filter?: { id_masjid?: string; kondisi?: string; q?: string }): FasilitasItem[] {
    const data = loadStore();
    let list = data.fasilitas;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((f) => f.id_masjid === filter.id_masjid);
    }
    if (filter?.kondisi && filter.kondisi !== 'all') {
      list = list.filter((f) => f.kondisi.toLowerCase() === filter.kondisi!.toLowerCase());
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase().trim();
      list = list.filter((f) => f.nama_fasilitas.toLowerCase().includes(q) || f.keterangan.toLowerCase().includes(q));
    }
    return list.map((f) => {
      const msj = data.masjids.find((m) => m.id_masjid === f.id_masjid);
      return {
        ...f,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  },

  createFasilitas(payload: Partial<FasilitasItem>): FasilitasItem {
    const data = loadStore();
    const nextNum = data.fasilitas.length + 1;
    const newId = payload.id_fasilitas || `FAS-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Fasilitas = {
      id_fasilitas: newId,
      id_masjid: String(payload.id_masjid || 'MSJ-001'),
      nama_fasilitas: String(payload.nama_fasilitas || '').trim(),
      jumlah: Number(payload.jumlah) || 1,
      kondisi: (payload.kondisi as any) || 'Baik',
      keterangan: String(payload.keterangan || ''),
      bisa_dipinjam: Boolean(payload.bisa_dipinjam),
      created_at: now,
      updated_at: now,
    };
    const idx = data.fasilitas.findIndex((f) => f.id_fasilitas === item.id_fasilitas);
    if (idx >= 0) data.fasilitas[idx] = item;
    else data.fasilitas.push(item);
    saveStore(data);
    this.markModified();
    return item;
  },

  updateFasilitas(id: string, updates: Partial<FasilitasItem>): FasilitasItem {
    const data = loadStore();
    const idx = data.fasilitas.findIndex((f) => f.id_fasilitas === id);
    if (idx === -1) throw new Error('Fasilitas tidak ditemukan.');
    data.fasilitas[idx] = {
      ...data.fasilitas[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(data);
    this.markModified();
    return data.fasilitas[idx];
  },

  deleteFasilitas(id: string): void {
    const data = loadStore();
    data.fasilitas = data.fasilitas.filter((f) => f.id_fasilitas !== id);
    saveStore(data);
    this.markModified();
  },

  // ===== PENGURUS =====
  getPengurus(filter?: { id_masjid?: string; jabatan?: string; q?: string }): PengurusItem[] {
    const data = loadStore();
    let list = data.pengurus;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((p) => p.id_masjid === filter.id_masjid);
    }
    if (filter?.jabatan && filter.jabatan !== 'all') {
      list = list.filter((p) => p.jabatan.toLowerCase().includes(filter.jabatan!.toLowerCase()));
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase().trim();
      list = list.filter((p) => p.nama_pengurus.toLowerCase().includes(q) || p.jabatan.toLowerCase().includes(q));
    }
    return list.map((p) => {
      const msj = data.masjids.find((m) => m.id_masjid === p.id_masjid);
      return {
        ...p,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  },

  createPengurus(payload: Partial<PengurusItem>): PengurusItem {
    const data = loadStore();
    const nextNum = data.pengurus.length + 1;
    const newId = payload.id_pengurus || `PGR-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Pengurus = {
      id_pengurus: newId,
      id_masjid: String(payload.id_masjid || 'MSJ-001'),
      nama_pengurus: String(payload.nama_pengurus || '').trim(),
      jabatan: String(payload.jabatan || '').trim(),
      kontak: String(payload.kontak || ''),
      periode: String(payload.periode || '2024 - 2027'),
      email: String(payload.email || ''),
      created_at: now,
      updated_at: now,
    };
    const idx = data.pengurus.findIndex((p) => p.id_pengurus === item.id_pengurus);
    if (idx >= 0) data.pengurus[idx] = item;
    else data.pengurus.push(item);
    saveStore(data);
    this.markModified();
    return item;
  },

  updatePengurus(id: string, updates: Partial<PengurusItem>): PengurusItem {
    const data = loadStore();
    const idx = data.pengurus.findIndex((p) => p.id_pengurus === id);
    if (idx === -1) throw new Error('Data pengurus tidak ditemukan.');
    data.pengurus[idx] = {
      ...data.pengurus[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(data);
    this.markModified();
    return data.pengurus[idx];
  },

  deletePengurus(id: string): void {
    const data = loadStore();
    data.pengurus = data.pengurus.filter((p) => p.id_pengurus !== id);
    saveStore(data);
    this.markModified();
  },

  // ===== KEGIATAN =====
  getKegiatan(filter?: { id_masjid?: string; status?: string; q?: string }): KegiatanItem[] {
    const data = loadStore();
    let list = data.kegiatan;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((k) => k.id_masjid === filter.id_masjid);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((k) => k.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase().trim();
      list = list.filter((k) => k.nama_kegiatan.toLowerCase().includes(q) || k.keterangan.toLowerCase().includes(q));
    }
    return list.map((k) => {
      const msj = data.masjids.find((m) => m.id_masjid === k.id_masjid);
      return {
        ...k,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  },

  createKegiatan(payload: Partial<KegiatanItem>): KegiatanItem {
    const data = loadStore();
    const nextNum = data.kegiatan.length + 1;
    const newId = payload.id_kegiatan || `KGT-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Kegiatan = {
      id_kegiatan: newId,
      id_masjid: String(payload.id_masjid || 'MSJ-001'),
      nama_kegiatan: String(payload.nama_kegiatan || '').trim(),
      tanggal: String(payload.tanggal || '').trim(),
      waktu: String(payload.waktu || '05:30 WITA'),
      penceramah: String(payload.penceramah || ''),
      lokasi: String(payload.lokasi || 'Ruang Utama Masjid'),
      keterangan: String(payload.keterangan || ''),
      status: (payload.status as any) || 'Akan Datang',
      created_at: now,
      updated_at: now,
    };
    const idx = data.kegiatan.findIndex((k) => k.id_kegiatan === item.id_kegiatan);
    if (idx >= 0) data.kegiatan[idx] = item;
    else data.kegiatan.push(item);
    saveStore(data);
    this.markModified();
    return item;
  },

  updateKegiatan(id: string, updates: Partial<KegiatanItem>): KegiatanItem {
    const data = loadStore();
    const idx = data.kegiatan.findIndex((k) => k.id_kegiatan === id);
    if (idx === -1) throw new Error('Kegiatan tidak ditemukan.');
    data.kegiatan[idx] = {
      ...data.kegiatan[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(data);
    this.markModified();
    return data.kegiatan[idx];
  },

  deleteKegiatan(id: string): void {
    const data = loadStore();
    data.kegiatan = data.kegiatan.filter((k) => k.id_kegiatan !== id);
    saveStore(data);
    this.markModified();
  },

  // ===== PENGUMUMAN =====
  getPengumuman(filter?: { id_masjid?: string; kategori?: string }): PengumumanItem[] {
    const data = loadStore();
    let list = data.pengumuman;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((p) => p.id_masjid === filter.id_masjid);
    }
    if (filter?.kategori && filter.kategori !== 'all') {
      list = list.filter((p) => p.kategori.toLowerCase() === filter.kategori!.toLowerCase());
    }
    return list.map((p) => {
      const msj = data.masjids.find((m) => m.id_masjid === p.id_masjid);
      return {
        ...p,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  },

  createPengumuman(payload: Partial<PengumumanItem>): PengumumanItem {
    const data = loadStore();
    const nextNum = data.pengumuman.length + 1;
    const newId = payload.id_pengumuman || `PGM-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Pengumuman = {
      id_pengumuman: newId,
      id_masjid: String(payload.id_masjid || 'MSJ-001'),
      judul: String(payload.judul || '').trim(),
      isi: String(payload.isi || '').trim(),
      tanggal: payload.tanggal || now.split('T')[0],
      penulis: payload.penulis || activeUserSession?.nama || 'Pengurus Masjid',
      kategori: (payload.kategori as any) || 'Umum',
      created_at: now,
      updated_at: now,
    };
    const idx = data.pengumuman.findIndex((p) => p.id_pengumuman === item.id_pengumuman);
    if (idx >= 0) data.pengumuman[idx] = item;
    else data.pengumuman.push(item);
    saveStore(data);
    this.markModified();
    return item;
  },

  updatePengumuman(id: string, updates: Partial<PengumumanItem>): PengumumanItem {
    const data = loadStore();
    const idx = data.pengumuman.findIndex((p) => p.id_pengumuman === id);
    if (idx === -1) throw new Error('Pengumuman tidak ditemukan.');
    data.pengumuman[idx] = {
      ...data.pengumuman[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(data);
    this.markModified();
    return data.pengumuman[idx];
  },

  deletePengumuman(id: string): void {
    const data = loadStore();
    data.pengumuman = data.pengumuman.filter((p) => p.id_pengumuman !== id);
    saveStore(data);
    this.markModified();
  },

  // ===== PEMINJAMAN =====
  getPeminjaman(filter?: { id_masjid?: string; status?: string; q?: string }): PeminjamanItem[] {
    const data = loadStore();
    let list = data.peminjaman;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((p) => p.id_masjid === filter.id_masjid);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((p) => p.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nama_pemohon.toLowerCase().includes(q) ||
          p.kode_pelacakan.toLowerCase().includes(q) ||
          p.tujuan_peminjaman.toLowerCase().includes(q)
      );
    }
    return list.map((p) => {
      const msj = data.masjids.find((m) => m.id_masjid === p.id_masjid);
      const fas = data.fasilitas.find((f) => f.id_fasilitas === p.id_fasilitas);
      return {
        ...p,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid',
        nama_fasilitas: fas ? fas.nama_fasilitas : 'Fasilitas',
      };
    });
  },

  submitPeminjaman(payload: any): PeminjamanItem {
    const data = loadStore();
    const count = data.peminjaman.length + 1;
    const year = new Date().getFullYear();
    const kode = payload.kode_pelacakan || `TRK-PMJ-${year}-${String(count).padStart(3, '0')}`;
    const id = payload.id_peminjaman || `PMJ-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const item: Peminjaman = {
      id_peminjaman: id,
      kode_pelacakan: kode,
      id_masjid: String(payload.id_masjid),
      id_fasilitas: String(payload.id_fasilitas),
      nama_pemohon: String(payload.nama_pemohon || '').trim(),
      nik_pemohon: String(payload.nik_pemohon || '').trim(),
      kontak_pemohon: String(payload.kontak_pemohon || '').trim(),
      email_pemohon: String(payload.email_pemohon || '').trim(),
      alamat_pemohon: String(payload.alamat_pemohon || '').trim(),
      tanggal_mulai: payload.tanggal_mulai,
      tanggal_selesai: payload.tanggal_selesai || payload.tanggal_mulai,
      waktu_mulai: payload.waktu_mulai || '08:00 WITA',
      waktu_selesai: payload.waktu_selesai || '12:00 WITA',
      tujuan_peminjaman: String(payload.tujuan_peminjaman || '').trim(),
      status: payload.status || 'Menunggu Verifikasi',
      catatan_petugas: payload.catatan_petugas || 'Pengajuan sedang dalam antrean pemeriksaan pengurus masjid.',
      created_at: now,
      updated_at: now,
    };

    const idx = data.peminjaman.findIndex((p) => p.kode_pelacakan === item.kode_pelacakan);
    if (idx >= 0) {
      data.peminjaman[idx] = item;
    } else {
      data.peminjaman.push(item);
      data.riwayat.push({
        id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        kode_pelacakan: kode,
        status: 'Menunggu Verifikasi',
        catatan: 'Permohonan peminjaman berhasil didaftarkan ke sistem SILAMAS.',
        petugas: 'Sistem SILAMAS',
        timestamp: now,
      });
    }

    saveStore(data);
    this.markModified();
    return item;
  },

  trackPeminjaman(kode: string): PeminjamanItem {
    const data = loadStore();
    const p = data.peminjaman.find((item) => item.kode_pelacakan.toLowerCase() === kode.toLowerCase().trim());
    if (!p) {
      throw new Error(`Data peminjaman dengan kode pengajuan "${kode}" tidak ditemukan.`);
    }
    const msj = data.masjids.find((m) => m.id_masjid === p.id_masjid);
    const fas = data.fasilitas.find((f) => f.id_fasilitas === p.id_fasilitas);
    const timeline = data.riwayat.filter((r) => r.kode_pelacakan.toLowerCase() === p.kode_pelacakan.toLowerCase());
    return {
      ...p,
      nama_masjid: msj?.nama_masjid,
      nama_fasilitas: fas?.nama_fasilitas,
      timeline,
    };
  },

  updateStatusPeminjaman(id: string, status: StatusPengajuan, catatan: string): PeminjamanItem {
    const data = loadStore();
    const idx = data.peminjaman.findIndex((p) => p.id_peminjaman === id);
    if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
    const now = new Date().toISOString();
    data.peminjaman[idx].status = status;
    data.peminjaman[idx].catatan_petugas = catatan;
    data.peminjaman[idx].updated_at = now;

    data.riwayat.push({
      id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kode_pelacakan: data.peminjaman[idx].kode_pelacakan,
      status,
      catatan,
      petugas: activeUserSession?.nama || 'Pengurus Masjid',
      timestamp: now,
    });

    saveStore(data);
    this.markModified();
    return data.peminjaman[idx];
  },

  // ===== LAYANAN =====
  getLayanan(filter?: { id_masjid?: string; status?: string; q?: string }): LayananItem[] {
    const data = loadStore();
    let list = data.layanan;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((l) => l.id_masjid === filter.id_masjid);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((l) => l.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.nama_pemohon.toLowerCase().includes(q) ||
          l.kode_pelacakan.toLowerCase().includes(q) ||
          l.jenis_layanan.toLowerCase().includes(q)
      );
    }
    return list.map((l) => {
      const msj = data.masjids.find((m) => m.id_masjid === l.id_masjid);
      return {
        ...l,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid',
      };
    });
  },

  submitLayanan(payload: any): LayananItem {
    const data = loadStore();
    const count = data.layanan.length + 1;
    const year = new Date().getFullYear();
    const kode = payload.kode_pelacakan || `TRK-LYN-${year}-${String(count).padStart(3, '0')}`;
    const id = payload.id_layanan || `LYN-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const item: LayananJemaah = {
      id_layanan: id,
      kode_pelacakan: kode,
      id_masjid: String(payload.id_masjid),
      jenis_layanan: String(payload.jenis_layanan || '').trim(),
      nama_pemohon: String(payload.nama_pemohon || '').trim(),
      nik_pemohon: String(payload.nik_pemohon || '').trim(),
      kontak_pemohon: String(payload.kontak_pemohon || '').trim(),
      alamat_pemohon: String(payload.alamat_pemohon || '').trim(),
      rincian_kebutuhan: String(payload.rincian_kebutuhan || '').trim(),
      status: payload.status || 'Menunggu Verifikasi',
      catatan_petugas: payload.catatan_petugas || 'Permohonan layanan jemaah diterima dan segera diperiksa pengurus.',
      created_at: now,
      updated_at: now,
    };

    const idx = data.layanan.findIndex((l) => l.kode_pelacakan === item.kode_pelacakan);
    if (idx >= 0) {
      data.layanan[idx] = item;
    } else {
      data.layanan.push(item);
      data.riwayat.push({
        id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        kode_pelacakan: kode,
        status: 'Menunggu Verifikasi',
        catatan: 'Permohonan layanan diajukan oleh jemaah.',
        petugas: 'Sistem SILAMAS',
        timestamp: now,
      });
    }

    saveStore(data);
    this.markModified();
    return item;
  },

  trackLayanan(kode: string): LayananItem {
    const data = loadStore();
    const l = data.layanan.find((item) => item.kode_pelacakan.toLowerCase() === kode.toLowerCase().trim());
    if (!l) {
      throw new Error(`Data permohonan layanan dengan kode pengajuan "${kode}" tidak ditemukan.`);
    }
    const msj = data.masjids.find((m) => m.id_masjid === l.id_masjid);
    const timeline: RiwayatStatus[] = data.riwayat.filter(
      (r) => r.kode_pelacakan.toLowerCase() === l.kode_pelacakan.toLowerCase()
    );
    return {
      ...l,
      nama_masjid: msj?.nama_masjid,
      timeline,
    };
  },

  updateStatusLayanan(id: string, status: StatusPengajuan, catatan: string): LayananItem {
    const data = loadStore();
    const idx = data.layanan.findIndex((l) => l.id_layanan === id);
    if (idx === -1) throw new Error('Permohonan layanan tidak ditemukan.');
    const now = new Date().toISOString();
    data.layanan[idx].status = status;
    data.layanan[idx].catatan_petugas = catatan;
    data.layanan[idx].updated_at = now;

    data.riwayat.push({
      id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kode_pelacakan: data.layanan[idx].kode_pelacakan,
      status,
      catatan,
      petugas: activeUserSession?.nama || 'Pengurus Masjid',
      timestamp: now,
    });

    saveStore(data);
    this.markModified();
    return data.layanan[idx];
  },

  // ===== LAPORAN =====
  getLaporanRekap(id_masjid?: string): any {
    const masjids = id_masjid
      ? this.getMasjids().filter((m) => m.id_masjid === id_masjid)
      : this.getMasjids();
    return {
      generated_at: new Date().toISOString(),
      user: activeUserSession,
      masjids,
      fasilitas: this.getFasilitas({ id_masjid }),
      pengurus: this.getPengurus({ id_masjid }),
      kegiatan: this.getKegiatan({ id_masjid }),
      peminjaman: this.getPeminjaman({ id_masjid }),
      layanan: this.getLayanan({ id_masjid }),
    };
  },

  // ===== AKUN PENGGUNA =====
  getUsers(): UserProfile[] {
    const data = loadStore();
    return data.users.map(({ password_hash: _, ...u }) => u);
  },

  createUser(payload: any): UserProfile {
    const data = loadStore();
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(payload.password || 'pengurus123', salt);
    const count = data.users.length + 1;
    const now = new Date().toISOString();
    const newUser: User = {
      id_user: payload.id_user || `USR-${String(count).padStart(3, '0')}`,
      nama: String(payload.nama || '').trim(),
      username: String(payload.username || '').toLowerCase().trim(),
      password_hash,
      role: payload.role || 'pengurus',
      id_masjid: payload.role === 'pengurus' ? payload.id_masjid : null,
      status_akun: 'Aktif',
      created_at: now,
      updated_at: now,
    };
    const idx = data.users.findIndex((u) => u.username === newUser.username);
    if (idx >= 0) data.users[idx] = newUser;
    else data.users.push(newUser);
    saveStore(data);
    this.markModified();
    const { password_hash: _, ...safe } = newUser;
    return safe;
  },

  updateUser(id: string, payload: any): UserProfile {
    const data = loadStore();
    const idx = data.users.findIndex((u) => u.id_user === id);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan.');
    if (payload.nama) data.users[idx].nama = payload.nama;
    if (payload.status_akun) data.users[idx].status_akun = payload.status_akun;
    if (payload.role) data.users[idx].role = payload.role;
    if (payload.id_masjid !== undefined) data.users[idx].id_masjid = payload.id_masjid;
    if (payload.password) {
      const salt = bcrypt.genSaltSync(10);
      data.users[idx].password_hash = bcrypt.hashSync(payload.password, salt);
    }
    data.users[idx].updated_at = new Date().toISOString();
    saveStore(data);
    this.markModified();
    const { password_hash: _, ...safe } = data.users[idx];
    return safe;
  },

  deleteUser(id: string): void {
    const data = loadStore();
    data.users = data.users.filter((u) => u.id_user !== id);
    saveStore(data);
    this.markModified();
  },
};
