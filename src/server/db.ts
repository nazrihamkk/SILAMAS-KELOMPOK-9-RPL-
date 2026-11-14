/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import fs from 'fs';
import path from 'path';
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
  StatusPengajuan,
} from './types.js';
import { getInitialSeedData } from './seedData.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANDIDATE_DB_PATHS = [
  path.join('/tmp', 'silamas_db.json'),
  path.resolve(process.cwd(), 'data', 'silamas_db.json'),
  path.resolve(__dirname, '../../data/silamas_db.json'),
  path.resolve(__dirname, '../data/silamas_db.json'),
];

const PRIMARY_DATA_DIR = path.resolve(process.cwd(), 'data');
const PRIMARY_DB_FILE = path.join(PRIMARY_DATA_DIR, 'silamas_db.json');
const TMP_DB_FILE = path.join('/tmp', 'silamas_db.json');

class Database {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = getInitialSeedData();
    this.init();
  }

  private findReadableDbFile(): string | null {
    // Pada lingkungan serverless, utamakan berkas di /tmp jika sudah diperbarui, lalu berkas bawaan data/silamas_db.json
    const pathsToCheck = process.env.VERCEL
      ? CANDIDATE_DB_PATHS
      : [PRIMARY_DB_FILE, ...CANDIDATE_DB_PATHS];

    for (const candidate of pathsToCheck) {
      try {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      } catch {
        // Abaikan kendala izin baca pada jalur alternatif
      }
    }
    return null;
  }

  private ensureSeedIntegrity(parsed: Partial<DatabaseSchema>): DatabaseSchema {
    const seed = getInitialSeedData();
    const users = Array.isArray(parsed.users) && parsed.users.length > 0 ? [...parsed.users] : [...seed.users];

    // Pastikan akun bawaan administrator dan pengurus selalu tersedia
    for (const seedUser of seed.users) {
      if (!users.some((u) => u.username.toLowerCase() === seedUser.username.toLowerCase())) {
        users.push(seedUser);
      }
    }

    const masjids =
      Array.isArray(parsed.masjids) && parsed.masjids.length > 0 && parsed.masjids[0].latitude !== undefined
        ? parsed.masjids
        : seed.masjids;

    return {
      schema_version: 2,
      users,
      masjids,
      fasilitas: Array.isArray(parsed.fasilitas) && parsed.fasilitas.length > 0 ? parsed.fasilitas : seed.fasilitas,
      pengurus: Array.isArray(parsed.pengurus) && parsed.pengurus.length > 0 ? parsed.pengurus : seed.pengurus,
      kegiatan: Array.isArray(parsed.kegiatan) && parsed.kegiatan.length > 0 ? parsed.kegiatan : seed.kegiatan,
      pengumuman: Array.isArray(parsed.pengumuman) && parsed.pengumuman.length > 0 ? parsed.pengumuman : seed.pengumuman,
      peminjaman: Array.isArray(parsed.peminjaman) && parsed.peminjaman.length > 0 ? parsed.peminjaman : seed.peminjaman,
      layanan: Array.isArray(parsed.layanan) && parsed.layanan.length > 0 ? parsed.layanan : seed.layanan,
      riwayat: Array.isArray(parsed.riwayat) && parsed.riwayat.length > 0 ? parsed.riwayat : seed.riwayat,
    };
  }

  private init() {
    try {
      const readableFile = this.findReadableDbFile();
      if (readableFile) {
        const raw = fs.readFileSync(readableFile, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
        this.data = this.ensureSeedIntegrity(parsed);
      } else {
        this.data = getInitialSeedData();
        this.save();
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('Menggunakan data awal bawaan karena berkas basis data belum terbaca:', err);
      this.data = getInitialSeedData();
      this.isInitialized = true;
    }
  }

  private save() {
    const serialized = JSON.stringify(this.data, null, 2);

    // Pada server lokal, simpan perubahan langsung ke data/silamas_db.json
    if (!process.env.VERCEL) {
      try {
        if (!fs.existsSync(PRIMARY_DATA_DIR)) {
          fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(PRIMARY_DB_FILE, serialized, 'utf-8');
        return;
      } catch {
        // Gunakan /tmp jika direktori utama tidak mengizinkan penulisan
      }
    }

    // Pada lingkungan serverless dengan sistem berkas baca-saja, simpan ke /tmp/silamas_db.json
    try {
      fs.writeFileSync(TMP_DB_FILE, serialized, 'utf-8');
    } catch {
      // Pertahankan data di memori jika penyimpanan sementara tidak tersedia
    }
  }

  public getFullState(): DatabaseSchema {
    return this.data;
  }

  public syncState(snapshot: Partial<DatabaseSchema>): DatabaseSchema {
    this.data = this.ensureSeedIntegrity({
      ...this.data,
      ...snapshot,
    });
    this.save();
    return this.data;
  }

  public resetToSeed(): DatabaseSchema {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  // ===== PENGGUNA =====
  public findUserByUsername(username: string): User | undefined {
    return this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id_user === id);
  }

  public listUsers(): Omit<User, 'password_hash'>[] {
    return this.data.users.map(({ password_hash, ...rest }) => rest);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id_user === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const prevLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id_user !== id);
    const deleted = this.data.users.length < prevLen;
    if (deleted) this.save();
    return deleted;
  }

  // ===== MASJID =====
  public listMasjids(filter?: { q?: string; kelurahan?: string }): (Masjid & { total_fasilitas: number; total_pengurus: number })[] {
    let result = this.data.masjids;

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
      total_fasilitas: this.data.fasilitas.filter((f) => f.id_masjid === m.id_masjid).length,
      total_pengurus: this.data.pengurus.filter((p) => p.id_masjid === m.id_masjid).length,
    }));
  }

  public getMasjidById(id: string): Masjid | undefined {
    return this.data.masjids.find((m) => m.id_masjid === id);
  }

  public validateMasjidUniqueness(
    payload: {
      nama_masjid: string;
      alamat: string;
      kelurahan?: string;
      latitude: number;
      longitude: number;
      foto_url?: string;
    },
    excludeId?: string
  ): { valid: boolean; message?: string } {
    const cleanName = payload.nama_masjid.trim().toLowerCase();
    const cleanAddr = payload.alamat.trim().toLowerCase();
    const cleanKel = (payload.kelurahan || '').trim().toLowerCase();
    const cleanPhoto = (payload.foto_url || '').trim();

    for (const existing of this.data.masjids) {
      if (excludeId && existing.id_masjid === excludeId) continue;

      const existName = existing.nama_masjid.trim().toLowerCase();
      const existAddr = existing.alamat.trim().toLowerCase();
      const existKel = existing.kelurahan.trim().toLowerCase();

      // 1. Periksa duplikasi nama dan alamat atau kelurahan masjid
      if (existName === cleanName && (existAddr === cleanAddr || (cleanKel && existKel === cleanKel))) {
        return {
          valid: false,
          message: `Data masjid "${payload.nama_masjid}" pada wilayah/alamat tersebut sudah terdaftar (${existing.id_masjid}). Data yang sama tidak boleh disimpan dua kali.`,
        };
      }

      // 2. Periksa duplikasi titik koordinat yang sama atau sangat berdekatan (~5 meter)
      const latDiff = Math.abs(existing.latitude - payload.latitude);
      const lngDiff = Math.abs(existing.longitude - payload.longitude);
      if (latDiff < 0.00005 && lngDiff < 0.00005) {
        return {
          valid: false,
          message: `Titik koordinat (${payload.latitude}, ${payload.longitude}) sudah digunakan oleh "${existing.nama_masjid}" (${existing.id_masjid}). Pastikan titik penanda sesuai lokasi masjid yang benar.`,
        };
      }

      // 3. Periksa duplikasi foto dari masjid lain
      if (cleanPhoto && existing.foto_url && existing.foto_url.trim() === cleanPhoto) {
        return {
          valid: false,
          message: `Foto yang diunggah atau ditautkan sudah digunakan pada "${existing.nama_masjid}" (${existing.id_masjid}). Dilarang menggunakan foto dari masjid lain.`,
        };
      }
    }

    return { valid: true };
  }

  public createMasjid(payload: Omit<Masjid, 'id_masjid' | 'created_at' | 'updated_at'>): Masjid {
    // Buat kode unik masjid baru secara berurutan
    const existingNums = this.data.masjids
      .map((m) => parseInt(m.id_masjid.replace('MSJ-', ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
    const newId = `MSJ-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const masjid: Masjid = {
      ...payload,
      id_masjid: newId,
      created_at: now,
      updated_at: now,
    };
    this.data.masjids.push(masjid);

    // Sinkronkan fasilitas ringkas ke daftar fasilitas masjid
    if (payload.fasilitas_ringkas) {
      const items = payload.fasilitas_ringkas
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      items.forEach((rawName) => {
        const lower = rawName.toLowerCase();
        const bisaDipinjam =
          lower.includes('ambulans') ||
          lower.includes('keranda') ||
          lower.includes('pengeras suara') ||
          lower.includes('mikrofon') ||
          lower.includes('kursi') ||
          lower.includes('tenda') ||
          lower.includes('aula');
        const fasId = `FAS-${String(this.data.fasilitas.length + 1).padStart(3, '0')}`;
        this.data.fasilitas.push({
          id_fasilitas: fasId,
          id_masjid: newId,
          nama_fasilitas: rawName.charAt(0).toUpperCase() + rawName.slice(1),
          jumlah: 1,
          kondisi: 'Baik',
          keterangan: `Fasilitas terdaftar pada ${masjid.nama_masjid}`,
          bisa_dipinjam: bisaDipinjam,
          created_at: now,
          updated_at: now,
        });
      });
    }

    // Sinkronkan nama pengurus utama ke daftar pengurus masjid
    if (
      payload.nama_pengurus_utama &&
      payload.nama_pengurus_utama.trim() !== '' &&
      payload.nama_pengurus_utama.trim().toLowerCase() !== 'belum tercatat' &&
      payload.nama_pengurus_utama.trim().toLowerCase() !== 'belum diverifikasi'
    ) {
      const pgrId = `PGR-${String(this.data.pengurus.length + 1).padStart(3, '0')}`;
      this.data.pengurus.push({
        id_pengurus: pgrId,
        id_masjid: newId,
        nama_pengurus: payload.nama_pengurus_utama.trim(),
        jabatan: 'Ketua / Pengurus Utama Masjid',
        kontak: payload.telepon || 'Belum tercatat',
        periode: '2024 - 2027',
        email: payload.email || '',
        created_at: now,
        updated_at: now,
      });
    }

    this.save();
    return masjid;
  }

  public updateMasjid(id: string, updates: Partial<Masjid>): Masjid | null {
    const idx = this.data.masjids.findIndex((m) => m.id_masjid === id);
    if (idx === -1) return null;
    this.data.masjids[idx] = {
      ...this.data.masjids[idx],
      ...updates,
      id_masjid: id,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.masjids[idx];
  }

  public deleteMasjid(id: string): boolean {
    const prev = this.data.masjids.length;
    this.data.masjids = this.data.masjids.filter((m) => m.id_masjid !== id);
    const deleted = this.data.masjids.length < prev;
    if (deleted) {
      this.data.fasilitas = this.data.fasilitas.filter((f) => f.id_masjid !== id);
      this.data.pengurus = this.data.pengurus.filter((p) => p.id_masjid !== id);
      this.data.kegiatan = this.data.kegiatan.filter((k) => k.id_masjid !== id);
      this.data.pengumuman = this.data.pengumuman.filter((p) => p.id_masjid !== id);
      this.save();
    }
    return deleted;
  }

  // ===== FASILITAS =====
  public listFasilitas(filter?: { id_masjid?: string; kondisi?: string; q?: string }): (Fasilitas & { nama_masjid?: string })[] {
    let list = this.data.fasilitas;
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
      const msj = this.data.masjids.find((m) => m.id_masjid === f.id_masjid);
      return {
        ...f,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  }

  public getFasilitasById(id: string): Fasilitas | undefined {
    return this.data.fasilitas.find((f) => f.id_fasilitas === id);
  }

  public createFasilitas(payload: Omit<Fasilitas, 'id_fasilitas' | 'created_at' | 'updated_at'>): Fasilitas {
    const nextNum = this.data.fasilitas.length + 1;
    const newId = `FAS-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Fasilitas = {
      ...payload,
      id_fasilitas: newId,
      created_at: now,
      updated_at: now,
    };
    this.data.fasilitas.push(item);
    this.save();
    return item;
  }

  public updateFasilitas(id: string, updates: Partial<Fasilitas>): Fasilitas | null {
    const idx = this.data.fasilitas.findIndex((f) => f.id_fasilitas === id);
    if (idx === -1) return null;
    this.data.fasilitas[idx] = {
      ...this.data.fasilitas[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.fasilitas[idx];
  }

  public deleteFasilitas(id: string): boolean {
    const prev = this.data.fasilitas.length;
    this.data.fasilitas = this.data.fasilitas.filter((f) => f.id_fasilitas !== id);
    const deleted = this.data.fasilitas.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // ===== PENGURUS =====
  public listPengurus(filter?: { id_masjid?: string; jabatan?: string; q?: string }): (Pengurus & { nama_masjid?: string })[] {
    let list = this.data.pengurus;
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
      const msj = this.data.masjids.find((m) => m.id_masjid === p.id_masjid);
      return {
        ...p,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  }

  public getPengurusById(id: string): Pengurus | undefined {
    return this.data.pengurus.find((p) => p.id_pengurus === id);
  }

  public createPengurus(payload: Omit<Pengurus, 'id_pengurus' | 'created_at' | 'updated_at'>): Pengurus {
    const nextNum = this.data.pengurus.length + 1;
    const newId = `PGR-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Pengurus = {
      ...payload,
      id_pengurus: newId,
      created_at: now,
      updated_at: now,
    };
    this.data.pengurus.push(item);
    this.save();
    return item;
  }

  public updatePengurus(id: string, updates: Partial<Pengurus>): Pengurus | null {
    const idx = this.data.pengurus.findIndex((p) => p.id_pengurus === id);
    if (idx === -1) return null;
    this.data.pengurus[idx] = {
      ...this.data.pengurus[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.pengurus[idx];
  }

  public deletePengurus(id: string): boolean {
    const prev = this.data.pengurus.length;
    this.data.pengurus = this.data.pengurus.filter((p) => p.id_pengurus !== id);
    const deleted = this.data.pengurus.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // ===== KEGIATAN =====
  public listKegiatan(filter?: { id_masjid?: string; status?: string; q?: string }): (Kegiatan & { nama_masjid?: string })[] {
    let list = this.data.kegiatan;
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
      const msj = this.data.masjids.find((m) => m.id_masjid === k.id_masjid);
      return {
        ...k,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  }

  public createKegiatan(payload: Omit<Kegiatan, 'id_kegiatan' | 'created_at' | 'updated_at'>): Kegiatan {
    const nextNum = this.data.kegiatan.length + 1;
    const newId = `KGT-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Kegiatan = {
      ...payload,
      id_kegiatan: newId,
      created_at: now,
      updated_at: now,
    };
    this.data.kegiatan.push(item);
    this.save();
    return item;
  }

  public updateKegiatan(id: string, updates: Partial<Kegiatan>): Kegiatan | null {
    const idx = this.data.kegiatan.findIndex((k) => k.id_kegiatan === id);
    if (idx === -1) return null;
    this.data.kegiatan[idx] = {
      ...this.data.kegiatan[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.kegiatan[idx];
  }

  public deleteKegiatan(id: string): boolean {
    const prev = this.data.kegiatan.length;
    this.data.kegiatan = this.data.kegiatan.filter((k) => k.id_kegiatan !== id);
    const deleted = this.data.kegiatan.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // ===== PENGUMUMAN =====
  public listPengumuman(filter?: { id_masjid?: string; kategori?: string }): (Pengumuman & { nama_masjid?: string })[] {
    let list = this.data.pengumuman;
    if (filter?.id_masjid && filter.id_masjid !== 'all') {
      list = list.filter((p) => p.id_masjid === filter.id_masjid);
    }
    if (filter?.kategori && filter.kategori !== 'all') {
      list = list.filter((p) => p.kategori.toLowerCase() === filter.kategori!.toLowerCase());
    }
    return list.map((p) => {
      const msj = this.data.masjids.find((m) => m.id_masjid === p.id_masjid);
      return {
        ...p,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid Tidak Diketahui',
      };
    });
  }

  public createPengumuman(payload: Omit<Pengumuman, 'id_pengumuman' | 'created_at' | 'updated_at'>): Pengumuman {
    const nextNum = this.data.pengumuman.length + 1;
    const newId = `PGM-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Pengumuman = {
      ...payload,
      id_pengumuman: newId,
      created_at: now,
      updated_at: now,
    };
    this.data.pengumuman.push(item);
    this.save();
    return item;
  }

  public updatePengumuman(id: string, updates: Partial<Pengumuman>): Pengumuman | null {
    const idx = this.data.pengumuman.findIndex((p) => p.id_pengumuman === id);
    if (idx === -1) return null;
    this.data.pengumuman[idx] = {
      ...this.data.pengumuman[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.pengumuman[idx];
  }

  public deletePengumuman(id: string): boolean {
    const prev = this.data.pengumuman.length;
    this.data.pengumuman = this.data.pengumuman.filter((p) => p.id_pengumuman !== id);
    const deleted = this.data.pengumuman.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // ===== PEMINJAMAN FASILITAS =====
  public listPeminjaman(filter?: { id_masjid?: string; status?: string; q?: string }): (Peminjaman & { nama_masjid?: string; nama_fasilitas?: string })[] {
    let list = this.data.peminjaman;
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
      const msj = this.data.masjids.find((m) => m.id_masjid === p.id_masjid);
      const fas = this.data.fasilitas.find((f) => f.id_fasilitas === p.id_fasilitas);
      return {
        ...p,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid',
        nama_fasilitas: fas ? fas.nama_fasilitas : 'Fasilitas',
      };
    });
  }

  public getPeminjamanByKode(kode: string): (Peminjaman & { nama_masjid?: string; nama_fasilitas?: string; timeline?: RiwayatStatus[] }) | null {
    const p = this.data.peminjaman.find((item) => item.kode_pelacakan.toLowerCase() === kode.toLowerCase().trim());
    if (!p) return null;
    const msj = this.data.masjids.find((m) => m.id_masjid === p.id_masjid);
    const fas = this.data.fasilitas.find((f) => f.id_fasilitas === p.id_fasilitas);
    const timeline = this.data.riwayat.filter((r) => r.kode_pelacakan.toLowerCase() === p.kode_pelacakan.toLowerCase());
    return {
      ...p,
      nama_masjid: msj?.nama_masjid,
      nama_fasilitas: fas?.nama_fasilitas,
      timeline,
    };
  }

  public createPeminjaman(payload: Omit<Peminjaman, 'id_peminjaman' | 'kode_pelacakan' | 'status' | 'catatan_petugas' | 'created_at' | 'updated_at'>): Peminjaman {
    const count = this.data.peminjaman.length + 1;
    const year = new Date().getFullYear();
    const kode = `TRK-PMJ-${year}-${String(count).padStart(3, '0')}`;
    const id = `PMJ-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const item: Peminjaman = {
      ...payload,
      id_peminjaman: id,
      kode_pelacakan: kode,
      status: 'Menunggu Verifikasi',
      catatan_petugas: 'Pengajuan sedang dalam antrean pemeriksaan pengurus masjid.',
      created_at: now,
      updated_at: now,
    };
    this.data.peminjaman.push(item);

    this.data.riwayat.push({
      id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kode_pelacakan: kode,
      status: 'Menunggu Verifikasi',
      catatan: 'Permohonan peminjaman berhasil didaftarkan ke sistem SILAMAS.',
      petugas: 'Sistem SILAMAS',
      timestamp: now,
    });

    this.save();
    return item;
  }

  public updateStatusPeminjaman(id: string, status: StatusPengajuan, catatan: string, petugas: string): Peminjaman | null {
    const idx = this.data.peminjaman.findIndex((p) => p.id_peminjaman === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    this.data.peminjaman[idx].status = status;
    this.data.peminjaman[idx].catatan_petugas = catatan;
    this.data.peminjaman[idx].updated_at = now;

    this.data.riwayat.push({
      id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kode_pelacakan: this.data.peminjaman[idx].kode_pelacakan,
      status,
      catatan,
      petugas,
      timestamp: now,
    });

    this.save();
    return this.data.peminjaman[idx];
  }

  // ===== LAYANAN JEMAAH =====
  public listLayanan(filter?: { id_masjid?: string; status?: string; q?: string }): (LayananJemaah & { nama_masjid?: string })[] {
    let list = this.data.layanan;
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
      const msj = this.data.masjids.find((m) => m.id_masjid === l.id_masjid);
      return {
        ...l,
        nama_masjid: msj ? msj.nama_masjid : 'Masjid',
      };
    });
  }

  public getLayananByKode(kode: string): (LayananJemaah & { nama_masjid?: string; timeline?: RiwayatStatus[] }) | null {
    const l = this.data.layanan.find((item) => item.kode_pelacakan.toLowerCase() === kode.toLowerCase().trim());
    if (!l) return null;
    const msj = this.data.masjids.find((m) => m.id_masjid === l.id_masjid);
    const timeline = this.data.riwayat.filter((r) => r.kode_pelacakan.toLowerCase() === l.kode_pelacakan.toLowerCase());
    return {
      ...l,
      nama_masjid: msj?.nama_masjid,
      timeline,
    };
  }

  public createLayanan(payload: Omit<LayananJemaah, 'id_layanan' | 'kode_pelacakan' | 'status' | 'catatan_petugas' | 'created_at' | 'updated_at'>): LayananJemaah {
    const count = this.data.layanan.length + 1;
    const year = new Date().getFullYear();
    const kode = `TRK-LYN-${year}-${String(count).padStart(3, '0')}`;
    const id = `LYN-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const item: LayananJemaah = {
      ...payload,
      id_layanan: id,
      kode_pelacakan: kode,
      status: 'Menunggu Verifikasi',
      catatan_petugas: 'Permohonan layanan jemaah diterima dan segera diperiksa pengurus.',
      created_at: now,
      updated_at: now,
    };
    this.data.layanan.push(item);

    this.data.riwayat.push({
      id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kode_pelacakan: kode,
      status: 'Menunggu Verifikasi',
      catatan: 'Permohonan layanan diajukan oleh jemaah.',
      petugas: 'Sistem SILAMAS',
      timestamp: now,
    });

    this.save();
    return item;
  }

  public updateStatusLayanan(id: string, status: StatusPengajuan, catatan: string, petugas: string): LayananJemaah | null {
    const idx = this.data.layanan.findIndex((l) => l.id_layanan === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    this.data.layanan[idx].status = status;
    this.data.layanan[idx].catatan_petugas = catatan;
    this.data.layanan[idx].updated_at = now;

    this.data.riwayat.push({
      id_riwayat: `RWY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kode_pelacakan: this.data.layanan[idx].kode_pelacakan,
      status,
      catatan,
      petugas,
      timestamp: now,
    });

    this.save();
    return this.data.layanan[idx];
  }

  // ===== STATISTIK & RINGKASAN DATA =====
  public getDashboardStats(userMasjidId?: string | null) {
    const masjids = this.data.masjids;
    let filteredFasilitas = this.data.fasilitas;
    let filteredKegiatan = this.data.kegiatan;
    let filteredPeminjaman = this.data.peminjaman;
    let filteredLayanan = this.data.layanan;

    if (userMasjidId) {
      filteredFasilitas = filteredFasilitas.filter((f) => f.id_masjid === userMasjidId);
      filteredKegiatan = filteredKegiatan.filter((k) => k.id_masjid === userMasjidId);
      filteredPeminjaman = filteredPeminjaman.filter((p) => p.id_masjid === userMasjidId);
      filteredLayanan = filteredLayanan.filter((l) => l.id_masjid === userMasjidId);
    }

    const totalKapasitas = userMasjidId
      ? masjids.find((m) => m.id_masjid === userMasjidId)?.kapasitas || 0
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
      totalPengurus: userMasjidId
        ? this.data.pengurus.filter((p) => p.id_masjid === userMasjidId).length
        : this.data.pengurus.length,
      totalKegiatan: filteredKegiatan.length,
      totalPeminjaman: filteredPeminjaman.length,
      totalLayanan: filteredLayanan.length,
      pendingPeminjaman: peminjamanStatus.pending,
      pendingLayanan: filteredLayanan.filter((l) => l.status === 'Menunggu Verifikasi').length,
      fasilitasKondisi,
      peminjamanStatus,
      kelurahanDistribusi,
    };
  }
}

export const db = new Database();
