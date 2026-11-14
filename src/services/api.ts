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

const API_BASE = '/api';

let memoryToken: string | null = null;

export function setMemoryAuthToken(token: string | null) {
  memoryToken = token;
}

function getAuthHeader(): Record<string, string> {
  if (memoryToken) {
    return { Authorization: `Bearer ${memoryToken}` };
  }
  return {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada sistem.');
  }
  return data.data;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch(`${API_BASE}/seed/reset`, {
      method: 'POST',
    });
    await handleResponse(res);
  },

  // Stats
  async getStats(masjid_id?: string): Promise<DashboardStats> {
    const query = masjid_id ? `?masjid_id=${encodeURIComponent(masjid_id)}` : '';
    const res = await fetch(`${API_BASE}/stats${query}`);
    return handleResponse(res);
  },

  // Masjid
  async getMasjids(filter?: { q?: string; kelurahan?: string }): Promise<MasjidItem[]> {
    const params = new URLSearchParams();
    if (filter?.q) params.set('q', filter.q);
    if (filter?.kelurahan) params.set('kelurahan', filter.kelurahan);
    const res = await fetch(`${API_BASE}/masjid?${params.toString()}`);
    return handleResponse(res);
  },

  async getMasjidDetail(id: string): Promise<MasjidItem> {
    const res = await fetch(`${API_BASE}/masjid/${id}`);
    return handleResponse(res);
  },

  async createMasjid(payload: Partial<MasjidItem>): Promise<MasjidItem> {
    const res = await fetch(`${API_BASE}/masjid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateMasjid(id: string, payload: Partial<MasjidItem>): Promise<MasjidItem> {
    const res = await fetch(`${API_BASE}/masjid/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteMasjid(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/masjid/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse(res);
  },

  // Fasilitas
  async getFasilitas(filter?: { id_masjid?: string; kondisi?: string; q?: string }): Promise<FasilitasItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.kondisi) params.set('kondisi', filter.kondisi);
    if (filter?.q) params.set('q', filter.q);
    const res = await fetch(`${API_BASE}/fasilitas?${params.toString()}`);
    return handleResponse(res);
  },

  async createFasilitas(payload: Partial<FasilitasItem>): Promise<FasilitasItem> {
    const res = await fetch(`${API_BASE}/fasilitas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateFasilitas(id: string, payload: Partial<FasilitasItem>): Promise<FasilitasItem> {
    const res = await fetch(`${API_BASE}/fasilitas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteFasilitas(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/fasilitas/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse(res);
  },

  // Pengurus
  async getPengurus(filter?: { id_masjid?: string; jabatan?: string; q?: string }): Promise<PengurusItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.jabatan) params.set('jabatan', filter.jabatan);
    if (filter?.q) params.set('q', filter.q);
    const res = await fetch(`${API_BASE}/pengurus?${params.toString()}`);
    return handleResponse(res);
  },

  async createPengurus(payload: Partial<PengurusItem>): Promise<PengurusItem> {
    const res = await fetch(`${API_BASE}/pengurus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updatePengurus(id: string, payload: Partial<PengurusItem>): Promise<PengurusItem> {
    const res = await fetch(`${API_BASE}/pengurus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deletePengurus(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/pengurus/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse(res);
  },

  // Kegiatan
  async getKegiatan(filter?: { id_masjid?: string; status?: string; q?: string }): Promise<KegiatanItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.q) params.set('q', filter.q);
    const res = await fetch(`${API_BASE}/kegiatan?${params.toString()}`);
    return handleResponse(res);
  },

  async createKegiatan(payload: Partial<KegiatanItem>): Promise<KegiatanItem> {
    const res = await fetch(`${API_BASE}/kegiatan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateKegiatan(id: string, payload: Partial<KegiatanItem>): Promise<KegiatanItem> {
    const res = await fetch(`${API_BASE}/kegiatan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteKegiatan(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/kegiatan/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse(res);
  },

  // Pengumuman
  async getPengumuman(filter?: { id_masjid?: string; kategori?: string }): Promise<PengumumanItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.kategori) params.set('kategori', filter.kategori);
    const res = await fetch(`${API_BASE}/pengumuman?${params.toString()}`);
    return handleResponse(res);
  },

  async createPengumuman(payload: Partial<PengumumanItem>): Promise<PengumumanItem> {
    const res = await fetch(`${API_BASE}/pengumuman`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updatePengumuman(id: string, payload: Partial<PengumumanItem>): Promise<PengumumanItem> {
    const res = await fetch(`${API_BASE}/pengumuman/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deletePengumuman(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/pengumuman/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse(res);
  },

  // Peminjaman
  async getPeminjaman(filter?: { id_masjid?: string; status?: string; q?: string }): Promise<PeminjamanItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.q) params.set('q', filter.q);
    const res = await fetch(`${API_BASE}/peminjaman?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async submitPeminjaman(payload: any): Promise<PeminjamanItem> {
    const res = await fetch(`${API_BASE}/peminjaman`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async trackPeminjaman(kode: string): Promise<PeminjamanItem> {
    const res = await fetch(`${API_BASE}/peminjaman/track/${encodeURIComponent(kode.trim())}`);
    return handleResponse(res);
  },

  async updateStatusPeminjaman(id: string, status: StatusPengajuan, catatan: string): Promise<PeminjamanItem> {
    const res = await fetch(`${API_BASE}/peminjaman/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, catatan }),
    });
    return handleResponse(res);
  },

  // Layanan
  async getLayanan(filter?: { id_masjid?: string; status?: string; q?: string }): Promise<LayananItem[]> {
    const params = new URLSearchParams();
    if (filter?.id_masjid) params.set('id_masjid', filter.id_masjid);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.q) params.set('q', filter.q);
    const res = await fetch(`${API_BASE}/layanan?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async submitLayanan(payload: any): Promise<LayananItem> {
    const res = await fetch(`${API_BASE}/layanan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async trackLayanan(kode: string): Promise<LayananItem> {
    const res = await fetch(`${API_BASE}/layanan/track/${encodeURIComponent(kode.trim())}`);
    return handleResponse(res);
  },

  async updateStatusLayanan(id: string, status: StatusPengajuan, catatan: string): Promise<LayananItem> {
    const res = await fetch(`${API_BASE}/layanan/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, catatan }),
    });
    return handleResponse(res);
  },

  // Laporan
  async getLaporanRekap(id_masjid?: string): Promise<any> {
    const query = id_masjid ? `?id_masjid=${encodeURIComponent(id_masjid)}` : '';
    const res = await fetch(`${API_BASE}/laporan/rekap${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Users
  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createUser(payload: any): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateUser(id: string, payload: any): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse(res);
  },
};
