export type UserRole = 'admin' | 'pengurus';

export interface UserProfile {
  id_user: string;
  nama: string;
  username: string;
  role: UserRole;
  id_masjid?: string | null;
  nama_masjid?: string | null;
  status_akun?: 'Aktif' | 'Nonaktif';
}

export interface MasjidItem {
  id_masjid: string;
  nama_masjid: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  kapasitas: number;
  kapasitas_teks: string;
  fasilitas_ringkas: string;
  nama_pengurus_utama: string;
  tahun_berdiri: number;
  deskripsi: string;
  telepon: string;
  email: string;
  luas_tanah: string;
  status_tanah: string;
  foto_url?: string;
  kata_kunci_foto_google?: string;
  status_foto?: string;
  sumber_data?: string;
  catatan_verifikasi?: string;
  skor_rekomendasi?: number;
  status_verifikasi?: 'Terverifikasi' | 'Perlu Verifikasi' | 'Belum diverifikasi';
  total_fasilitas?: number;
  total_pengurus?: number;
  created_at: string;
  updated_at: string;
  fasilitas?: FasilitasItem[];
  pengurus?: PengurusItem[];
  kegiatan?: KegiatanItem[];
  pengumuman?: PengumumanItem[];
}

export interface FasilitasItem {
  id_fasilitas: string;
  id_masjid: string;
  nama_masjid?: string;
  nama_fasilitas: string;
  jumlah: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  keterangan: string;
  bisa_dipinjam: boolean;
  created_at: string;
  updated_at: string;
}

export interface PengurusItem {
  id_pengurus: string;
  id_masjid: string;
  nama_masjid?: string;
  nama_pengurus: string;
  jabatan: string;
  kontak: string;
  periode: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface KegiatanItem {
  id_kegiatan: string;
  id_masjid: string;
  nama_masjid?: string;
  nama_kegiatan: string;
  tanggal: string;
  waktu: string;
  penceramah?: string;
  lokasi: string;
  keterangan: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';
  created_at: string;
  updated_at: string;
}

export interface PengumumanItem {
  id_pengumuman: string;
  id_masjid: string;
  nama_masjid?: string;
  judul: string;
  isi: string;
  tanggal: string;
  penulis: string;
  kategori: 'Umum' | 'Keuangan' | 'Kegiatan' | 'Duka Cita';
  created_at: string;
  updated_at: string;
}

export type StatusPengajuan = 'Menunggu Verifikasi' | 'Diproses' | 'Disetujui' | 'Ditolak' | 'Selesai';

export interface RiwayatTimeline {
  id_riwayat: string;
  kode_pelacakan: string;
  status: StatusPengajuan;
  catatan: string;
  petugas: string;
  timestamp: string;
}

export interface PeminjamanItem {
  id_peminjaman: string;
  kode_pelacakan: string;
  id_masjid: string;
  id_fasilitas: string;
  nama_masjid?: string;
  nama_fasilitas?: string;
  nama_pemohon: string;
  nik_pemohon: string;
  kontak_pemohon: string;
  email_pemohon: string;
  alamat_pemohon: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tujuan_peminjaman: string;
  status: StatusPengajuan;
  catatan_petugas: string;
  created_at: string;
  updated_at: string;
  timeline?: RiwayatTimeline[];
}

export interface LayananItem {
  id_layanan: string;
  kode_pelacakan: string;
  id_masjid: string;
  nama_masjid?: string;
  jenis_layanan: string;
  nama_pemohon: string;
  nik_pemohon?: string;
  kontak_pemohon: string;
  alamat_pemohon: string;
  rincian_kebutuhan: string;
  status: StatusPengajuan;
  catatan_petugas: string;
  created_at: string;
  updated_at: string;
  timeline?: RiwayatTimeline[];
}

export interface DashboardStats {
  totalMasjid: number;
  totalKapasitas: number;
  totalFasilitas: number;
  totalPengurus: number;
  totalKegiatan: number;
  totalPeminjaman: number;
  totalLayanan: number;
  pendingPeminjaman: number;
  pendingLayanan: number;
  fasilitasKondisi: {
    baik: number;
    rusak_ringan: number;
    rusak_berat: number;
  };
  peminjamanStatus: {
    pending: number;
    disetujui: number;
    selesai: number;
    ditolak: number;
  };
  kelurahanDistribusi: Record<string, number>;
}
