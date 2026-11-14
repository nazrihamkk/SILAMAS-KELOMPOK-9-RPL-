/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

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
import { localStore } from './localStore.js';

const API_BASE = '/api';

let memoryToken: string | null = null;

export function setMemoryAuthToken(token: string | null) {
  memoryToken = token;
  if (!token) {
    localStore.setSessionUser(null);
  }
}

function getAuthHeader(): Record<string, string> {
  if (memoryToken) {
    return { Authorization: `Bearer ${memoryToken}` };
  }
  return {};
}

class NonJsonResponseError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'NonJsonResponseError';
    this.status = status;
  }
}

/**
 * Memeriksa status respons dan tipe konten sebelum mengurai data JSON
 * agar halaman 404 atau teks biasa tidak menyebabkan kesalahan pembacaan JSON.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!isJson) {
    const rawText = await res.text().catch(() => '');
    throw new NonJsonResponseError(
      res.status,
      rawText || `Respons server bukan JSON (HTTP ${res.status})`
    );
  }

  let parsed: any;
  try {
    parsed = await res.json();
  } catch {
    throw new NonJsonResponseError(res.status, `Format JSON tidak valid (HTTP ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(parsed?.message || `Permintaan gagal dengan kode status ${res.status}.`);
  }

  return parsed.data as T;
}

async function requestWithFallback<T>(
  requestFn: () => Promise<Response>,
  fallbackFn: () => T | Promise<T>,
  preferLocalWhenModified = false
): Promise<T> {
  if (preferLocalWhenModified && localStore.hasCustomModifications()) {
    // Sinkronkan permintaan ke server di latar belakang sembari mengembalikan data yang tersimpan
    requestFn().catch(() => {});
    return await fallbackFn();
  }

  try {
    const res = await requestFn();
    return await handleResponse<T>(res);
  } catch (err) {
    if (err instanceof NonJsonResponseError || err instanceof TypeError) {
      return await fallbackFn();
    }
    // Gunakan penyimpanan lokal apabila server baru dimuat ulang dan belum memiliki perubahan terbaru
    try {
      return await fallbackFn();
    } catch {
      throw err;
    }
  }
}

export const api = {
  // Autentikasi Pengguna
  async login(username: string, password: string): Promise<{ token: string; user: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await handleResponse<{ token: string; user: UserProfile }>(res);
      localStore.setSessionUser(result.user);
      return result;
    } catch (err) {
      // Gunakan verifikasi penyimpanan lokal jika respons server bukan JSON atau terdapat perubahan akun
      if (err instanceof NonJsonResponseError || err instanceof TypeError || localStore.hasCustomModifications()) {
        return localStore.login(username, password);
      }
      throw err;
    }
  },

  async getMe(): Promise<UserProfile> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/auth/me`, {
          headers: { ...getAuthHeader() },
        }),
      () => localStore.getMe(memoryToken),
      true
    );
  },

  async resetDatabase(): Promise<void> {
    localStore.resetToSeed();
    try {
      const res = await fetch(`${API_BASE}/seed/reset`, {
        method: 'POST',
      });
      await handleResponse(res);
    } catch {
      // Penyimpanan lokal telah dikembalikan ke 10 data masjid awal
    }
  },

  // Statistik Ringkasan
  async getStats(masjid_id?: string): Promise<DashboardStats> {
    const query = masjid_id ? `?masjid_id=${encodeURIComponent(masjid_id)}` : '';
    return requestWithFallback(
      () => fetch(`${API_BASE}/stats${query}`),
      () => localStore.getStats(masjid_id),
      true
    );
  },

  // Data Masjid (/api/masjids)
  async getMasjids(filter?: { q?: string; kelurahan?: string }): Promise<MasjidItem[]> {
    const params = new URLSearchParams();
    if (filter?.q) params.set('q', filter.q);
    if (filter?.kelurahan) params.set('kelurahan', filter.kelurahan);
    const qs = params.toString();
    const url = qs ? `${API_BASE}/masjids?${qs}` : `${API_BASE}/masjids`;

    const list = await requestWithFallback(
      () => fetch(url),
      () => localStore.getMasjids(filter),
      true
    );

    if (!Array.isArray(list) || list.length === 0) {
      if (!filter?.q && (!filter?.kelurahan || filter.kelurahan === 'Semua')) {
        return localStore.getMasjids(filter);
      }
    }
    return list;
  },

  async getMasjidDetail(id: string): Promise<MasjidItem> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/masjids/${encodeURIComponent(id)}`),
      () => localStore.getMasjidDetail(id),
      true
    );
  },

  async createMasjid(payload: Partial<MasjidItem>): Promise<MasjidItem> {
    try {
      const res = await fetch(`${API_BASE}/masjids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<MasjidItem>(res);
      localStore.createMasjid(created);
      return created;
    } catch (err) {
      if (err instanceof NonJsonResponseError || err instanceof TypeError) {
        return localStore.createMasjid(payload);
      }
      // Simpan ke penyimpanan lokal jika sesi aktif berasal dari penyimpanan lokal
      if (memoryToken?.startsWith('silamas_tok_')) {
        return localStore.createMasjid(payload);
      }
      throw err;
    }
  },

  async updateMasjid(id: string, payload: Partial<MasjidItem>): Promise<MasjidItem> {
    try {
      const res = await fetch(`${API_BASE}/masjids/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const updated = await handleResponse<MasjidItem>(res);
      localStore.updateMasjid(id, updated);
      return updated;
    } catch (err) {
      if (
        err instanceof NonJsonResponseError ||
        err instanceof TypeError ||
        memoryToken?.startsWith('silamas_tok_') ||
        localStore.hasCustomModifications()
      ) {
        return localStore.updateMasjid(id, payload);
      }
      throw err;
    }
  },

  async deleteMasjid(id: string): Promise<void> {
    localStore.deleteMasjid(id);
    try {
      const res = await fetch(`${API_BASE}/masjids/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      await handleResponse(res);
    } catch {
      // Data masjid telah dihapus pada penyimpanan lokal
    }
  },

  // Data Fasilitas
  async getFasilitas(filter?: { id_masjid?: string; kondisi?: string; q?: string }): Promise<FasilitasItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.kondisi) params.set('kondisi', filter.kondisi);
    if (filter?.q) params.set('q', filter.q);
    return requestWithFallback(
      () => fetch(`${API_BASE}/fasilitas?${params.toString()}`),
      () => localStore.getFasilitas(filter),
      true
    );
  },

  async createFasilitas(payload: Partial<FasilitasItem>): Promise<FasilitasItem> {
    try {
      const res = await fetch(`${API_BASE}/fasilitas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<FasilitasItem>(res);
      localStore.createFasilitas(created);
      return created;
    } catch {
      return localStore.createFasilitas(payload);
    }
  },

  async updateFasilitas(id: string, payload: Partial<FasilitasItem>): Promise<FasilitasItem> {
    try {
      const res = await fetch(`${API_BASE}/fasilitas/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const updated = await handleResponse<FasilitasItem>(res);
      localStore.updateFasilitas(id, updated);
      return updated;
    } catch {
      return localStore.updateFasilitas(id, payload);
    }
  },

  async deleteFasilitas(id: string): Promise<void> {
    localStore.deleteFasilitas(id);
    try {
      const res = await fetch(`${API_BASE}/fasilitas/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      await handleResponse(res);
    } catch {
      // Perubahan telah disimpan di penyimpanan lokal
    }
  },

  // Pengurus
  async getPengurus(filter?: { id_masjid?: string; jabatan?: string; q?: string }): Promise<PengurusItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.jabatan) params.set('jabatan', filter.jabatan);
    if (filter?.q) params.set('q', filter.q);
    return requestWithFallback(
      () => fetch(`${API_BASE}/pengurus?${params.toString()}`),
      () => localStore.getPengurus(filter),
      true
    );
  },

  async createPengurus(payload: Partial<PengurusItem>): Promise<PengurusItem> {
    try {
      const res = await fetch(`${API_BASE}/pengurus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<PengurusItem>(res);
      localStore.createPengurus(created);
      return created;
    } catch {
      return localStore.createPengurus(payload);
    }
  },

  async updatePengurus(id: string, payload: Partial<PengurusItem>): Promise<PengurusItem> {
    try {
      const res = await fetch(`${API_BASE}/pengurus/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const updated = await handleResponse<PengurusItem>(res);
      localStore.updatePengurus(id, updated);
      return updated;
    } catch {
      return localStore.updatePengurus(id, payload);
    }
  },

  async deletePengurus(id: string): Promise<void> {
    localStore.deletePengurus(id);
    try {
      const res = await fetch(`${API_BASE}/pengurus/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      await handleResponse(res);
    } catch {
      // Perubahan telah disimpan di penyimpanan lokal
    }
  },

  // Kegiatan
  async getKegiatan(filter?: { id_masjid?: string; status?: string; q?: string }): Promise<KegiatanItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.q) params.set('q', filter.q);
    return requestWithFallback(
      () => fetch(`${API_BASE}/kegiatan?${params.toString()}`),
      () => localStore.getKegiatan(filter),
      true
    );
  },

  async createKegiatan(payload: Partial<KegiatanItem>): Promise<KegiatanItem> {
    try {
      const res = await fetch(`${API_BASE}/kegiatan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<KegiatanItem>(res);
      localStore.createKegiatan(created);
      return created;
    } catch {
      return localStore.createKegiatan(payload);
    }
  },

  async updateKegiatan(id: string, payload: Partial<KegiatanItem>): Promise<KegiatanItem> {
    try {
      const res = await fetch(`${API_BASE}/kegiatan/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const updated = await handleResponse<KegiatanItem>(res);
      localStore.updateKegiatan(id, updated);
      return updated;
    } catch {
      return localStore.updateKegiatan(id, payload);
    }
  },

  async deleteKegiatan(id: string): Promise<void> {
    localStore.deleteKegiatan(id);
    try {
      const res = await fetch(`${API_BASE}/kegiatan/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      await handleResponse(res);
    } catch {
      // Perubahan telah disimpan di penyimpanan lokal
    }
  },

  // Pengumuman
  async getPengumuman(filter?: { id_masjid?: string; kategori?: string }): Promise<PengumumanItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.kategori) params.set('kategori', filter.kategori);
    return requestWithFallback(
      () => fetch(`${API_BASE}/pengumuman?${params.toString()}`),
      () => localStore.getPengumuman(filter),
      true
    );
  },

  async createPengumuman(payload: Partial<PengumumanItem>): Promise<PengumumanItem> {
    try {
      const res = await fetch(`${API_BASE}/pengumuman`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<PengumumanItem>(res);
      localStore.createPengumuman(created);
      return created;
    } catch {
      return localStore.createPengumuman(payload);
    }
  },

  async updatePengumuman(id: string, payload: Partial<PengumumanItem>): Promise<PengumumanItem> {
    try {
      const res = await fetch(`${API_BASE}/pengumuman/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const updated = await handleResponse<PengumumanItem>(res);
      localStore.updatePengumuman(id, updated);
      return updated;
    } catch {
      return localStore.updatePengumuman(id, payload);
    }
  },

  async deletePengumuman(id: string): Promise<void> {
    localStore.deletePengumuman(id);
    try {
      const res = await fetch(`${API_BASE}/pengumuman/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      await handleResponse(res);
    } catch {
      // Perubahan telah disimpan di penyimpanan lokal
    }
  },

  // Peminjaman
  async getPeminjaman(filter?: { id_masjid?: string; status?: string; q?: string }): Promise<PeminjamanItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.q) params.set('q', filter.q);
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/peminjaman?${params.toString()}`, {
          headers: { ...getAuthHeader() },
        }),
      () => localStore.getPeminjaman(filter),
      true
    );
  },

  async submitPeminjaman(payload: any): Promise<PeminjamanItem> {
    try {
      const res = await fetch(`${API_BASE}/peminjaman`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<PeminjamanItem>(res);
      localStore.submitPeminjaman(created);
      return created;
    } catch {
      return localStore.submitPeminjaman(payload);
    }
  },

  async trackPeminjaman(kode: string): Promise<PeminjamanItem> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/peminjaman/track/${encodeURIComponent(kode.trim())}`),
      () => localStore.trackPeminjaman(kode),
      true
    );
  },

  async updateStatusPeminjaman(id: string, status: StatusPengajuan, catatan: string): Promise<PeminjamanItem> {
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, catatan }),
      });
      const updated = await handleResponse<PeminjamanItem>(res);
      localStore.updateStatusPeminjaman(id, status, catatan);
      return updated;
    } catch {
      return localStore.updateStatusPeminjaman(id, status, catatan);
    }
  },

  // Layanan
  async getLayanan(filter?: { id_masjid?: string; status?: string; q?: string }): Promise<LayananItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.q) params.set('q', filter.q);
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/layanan?${params.toString()}`, {
          headers: { ...getAuthHeader() },
        }),
      () => localStore.getLayanan(filter),
      true
    );
  },

  async submitLayanan(payload: any): Promise<LayananItem> {
    try {
      const res = await fetch(`${API_BASE}/layanan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<LayananItem>(res);
      localStore.submitLayanan(created);
      return created;
    } catch {
      return localStore.submitLayanan(payload);
    }
  },

  async trackLayanan(kode: string): Promise<LayananItem> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/layanan/track/${encodeURIComponent(kode.trim())}`),
      () => localStore.trackLayanan(kode),
      true
    );
  },

  async updateStatusLayanan(id: string, status: StatusPengajuan, catatan: string): Promise<LayananItem> {
    try {
      const res = await fetch(`${API_BASE}/layanan/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, catatan }),
      });
      const updated = await handleResponse<LayananItem>(res);
      localStore.updateStatusLayanan(id, status, catatan);
      return updated;
    } catch {
      return localStore.updateStatusLayanan(id, status, catatan);
    }
  },

  // Laporan
  async getLaporanRekap(id_masjid?: string): Promise<any> {
    const query = id_masjid ? `?id_masjid=${encodeURIComponent(id_masjid)}` : '';
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/laporan/rekap${query}`, {
          headers: { ...getAuthHeader() },
        }),
      () => localStore.getLaporanRekap(id_masjid),
      true
    );
  },

  // Akun Pengguna
  async getUsers(): Promise<UserProfile[]> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/users`, {
          headers: { ...getAuthHeader() },
        }),
      () => localStore.getUsers(),
      true
    );
  },

  async createUser(payload: any): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const created = await handleResponse<UserProfile>(res);
      localStore.createUser({ ...payload, id_user: created.id_user });
      return created;
    } catch {
      return localStore.createUser(payload);
    }
  },

  async updateUser(id: string, payload: any): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const updated = await handleResponse<UserProfile>(res);
      localStore.updateUser(id, payload);
      return updated;
    } catch {
      return localStore.updateUser(id, payload);
    }
  },

  async deleteUser(id: string): Promise<void> {
    localStore.deleteUser(id);
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      await handleResponse(res);
    } catch {
      // Perubahan telah disimpan di penyimpanan lokal
    }
  },
};
