export type UserRole = 'admin' | 'pengurus';

export interface User {
  id_user: string;
  nama: string;
  username: string;
  password_hash: string;
  role: UserRole;
  id_masjid?: string | null;
  status_akun: 'Aktif' | 'Nonaktif';
  created_at: string;
  updated_at: string;
}

export interface Masjid {
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
  created_at: string;
  updated_at: string;
}

export interface Fasilitas {
  id_fasilitas: string;
  id_masjid: string;
  nama_fasilitas: string;
  jumlah: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  keterangan: string;
  bisa_dipinjam: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pengurus {
  id_pengurus: string;
  id_masjid: string;
  nama_pengurus: string;
  jabatan: string;
  kontak: string;
  periode: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Kegiatan {
  id_kegiatan: string;
  id_masjid: string;
  nama_kegiatan: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // e.g. 05:30 - 07:00 WITA
  penceramah?: string;
  lokasi: string;
  keterangan: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';
  created_at: string;
  updated_at: string;
}

export interface Pengumuman {
  id_pengumuman: string;
  id_masjid: string;
  judul: string;
  isi: string;
  tanggal: string;
  penulis: string;
  kategori: 'Umum' | 'Keuangan' | 'Kegiatan' | 'Duka Cita';
  created_at: string;
  updated_at: string;
}

export type StatusPengajuan = 'Menunggu Verifikasi' | 'Diproses' | 'Disetujui' | 'Ditolak' | 'Selesai';

export interface Peminjaman {
  id_peminjaman: string;
  kode_pelacakan: string;
  id_masjid: string;
  id_fasilitas: string;
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
}

export interface LayananJemaah {
  id_layanan: string;
  kode_pelacakan: string;
  id_masjid: string;
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
}

export interface RiwayatStatus {
  id_riwayat: string;
  kode_pelacakan: string;
  status: StatusPengajuan;
  catatan: string;
  petugas: string;
  timestamp: string;
}

export interface DatabaseSchema {
  schema_version?: number;
  users: User[];
  masjids: Masjid[];
  fasilitas: Fasilitas[];
  pengurus: Pengurus[];
  kegiatan: Kegiatan[];
  pengumuman: Pengumuman[];
  peminjaman: Peminjaman[];
  layanan: LayananJemaah[];
  riwayat: RiwayatStatus[];
}
