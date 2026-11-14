/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import bcrypt from 'bcryptjs';
import { DatabaseSchema, Fasilitas, Pengurus } from './types.js';

interface CsvMasjidSource {
  id_masjid: string;
  nama_masjid: string;
  kelurahan: string;
  alamat: string;
  latitude: number;
  longitude: number;
  kapasitas: number;
  kapasitas_teks: string;
  fasilitas_ringkas: string;
  nama_pengurus_utama: string;
  deskripsi: string;
  kata_kunci_foto_google: string;
  status_foto: string;
  sumber_data: string;
  catatan_verifikasi: string;
  skor_rekomendasi: number;
  tahun_berdiri: number;
  telepon: string;
  email: string;
}

const VERIFIED_10_MASJIDS: CsvMasjidSource[] = [
  {
    id_masjid: 'MSJ-001',
    nama_masjid: 'Masjid Agung Baiturrahim',
    kelurahan: 'Lolu Utara',
    alamat: 'Jl. Masjid Raya No. 30, Lolu Utara, Kota Palu, Sulawesi Tengah',
    latitude: -0.901407,
    longitude: 119.874548,
    kapasitas: 1000,
    kapasitas_teks: 'Sekitar 1.000 jemaah',
    fasilitas_ringkas: 'AC; kipas angin; tempat wudu; toilet; mimbar; lemari Al-Quran; mukena; karpet; rak sepatu',
    nama_pengurus_utama: 'Ammuh',
    deskripsi: 'Masjid utama di Lolu Utara dengan ruang ibadah luas dan fasilitas lengkap untuk mendukung kenyamanan jemaah.',
    kata_kunci_foto_google: 'Masjid Agung Baiturrahim Jl Masjid Raya No 30 Palu',
    status_foto: 'Foto eksterior terverifikasi tersedia',
    sumber_data: 'Tabel GIS.csv; https://syiar.id/view/314; https://dkm.or.id/dkm/427198/agung-baiturrahim-4adb683c25185ca96270dad2da99616b',
    catatan_verifikasi: 'Koordinat GIS sangat dekat dengan titik publik. Kapasitas memakai data publik sekitar 1.000 jemaah.',
    skor_rekomendasi: 10.0,
    tahun_berdiri: 1978,
    telepon: '0812-4211-9870',
    email: 'baiturrahim.lolu@silamas.id',
  },
  {
    id_masjid: 'MSJ-002',
    nama_masjid: 'Masjid Al-Munawwarah',
    kelurahan: 'Lolu Selatan',
    alamat: 'Jl. R.A. Kartini No. 80, Lolu Selatan, Kota Palu, Sulawesi Tengah',
    latitude: -0.901698,
    longitude: 119.880734,
    kapasitas: 500,
    kapasitas_teks: 'Sekitar 500 jemaah',
    fasilitas_ringkas: 'ATM beras; Wi-Fi; AC; rak Al-Quran; lemari; CCTV',
    nama_pengurus_utama: 'Muktar Ibnu Masud',
    deskripsi: 'Masjid dengan fasilitas ibadah dan layanan sosial unggulan, termasuk ATM beras, Wi-Fi, dan CCTV.',
    kata_kunci_foto_google: 'Masjid Al Munawwarah Jl RA Kartini No 80 Palu',
    status_foto: 'Foto publik tersedia; cocokkan papan nama bangunan',
    sumber_data: 'Tabel GIS.csv; https://www.cybo.com/ID-biz/masjid-al-munawwarah_10G; https://palu.tribunnews.com/2021/05/13/salat-id-di-masjid-al-munawwarah-palu-jamaah-tak-boleh-lepas-masker-selama-ibadah',
    catatan_verifikasi: 'Alamat dikonfirmasi sumber publik. Penulisan nama pengurus perlu konfirmasi akhir.',
    skor_rekomendasi: 9.6,
    tahun_berdiri: 1986,
    telepon: '0813-4120-5502',
    email: 'almunawwarah.kartini@silamas.id',
  },
  {
    id_masjid: 'MSJ-003',
    nama_masjid: 'Masjid Darul Arqam',
    kelurahan: 'Lolu Utara',
    alamat: 'Jl. Sultan Hasanuddin No. 62, Lolu Utara, Kota Palu, Sulawesi Tengah',
    latitude: -0.8962166555364609,
    longitude: 119.86676964299538,
    kapasitas: 250,
    kapasitas_teks: 'Sekitar 200-250 jemaah',
    fasilitas_ringkas: 'AC; WC; kipas angin; pengeras suara; mimbar; papan tulis; buku; jam dinding; jam digital',
    nama_pengurus_utama: 'Belum tercatat',
    deskripsi: 'Masjid yang mendukung kegiatan ibadah dan pembelajaran dengan papan tulis, koleksi buku, serta fasilitas penunjang yang lengkap.',
    kata_kunci_foto_google: 'Masjid Darul Arqam Jl Sultan Hasanuddin No 62 Palu',
    status_foto: 'Foto publik tersedia dan lokasi terverifikasi silang',
    sumber_data: 'Tabel GIS.csv; https://indonesia.worldplaces.me/view-place/79510703-masjid-darul-arqam.html; https://masjid.nearmei.id/masjid-darul-arqam-palu/',
    catatan_verifikasi: 'Koordinat pengguna, GIS, dan sumber publik konsisten pada titik yang sama.',
    skor_rekomendasi: 9.5,
    tahun_berdiri: 1992,
    telepon: '-',
    email: 'darularqam.lolu@silamas.id',
  },
  {
    id_masjid: 'MSJ-004',
    nama_masjid: 'Masjid Al-Ikhlas',
    kelurahan: 'Besusu Timur',
    alamat: 'Jl. M.H. Thamrin No. 41, Besusu Timur, Kota Palu, Sulawesi Tengah',
    latitude: -0.895084,
    longitude: 119.881777,
    kapasitas: 800,
    kapasitas_teks: 'Sekitar 800 jemaah',
    fasilitas_ringkas: 'Kipas angin; AC; pengeras suara; gudang; WC; jam digital',
    nama_pengurus_utama: 'Dr. Rudy Herman, M.T.',
    deskripsi: 'Masjid berkapasitas besar di Besusu Timur dengan pendingin ruangan dan fasilitas penunjang kegiatan ibadah.',
    kata_kunci_foto_google: 'Masjid Al Ikhlas MH Thamrin No 41 Besusu Timur Palu',
    status_foto: 'Foto kegiatan tersedia; foto eksterior perlu dicocokkan',
    sumber_data: 'Tabel GIS.csv',
    catatan_verifikasi: 'Alamat telah dirapikan dari data tabel. Hindari foto Masjid Al-Ikhlas lain yang bernama sama.',
    skor_rekomendasi: 9.2,
    tahun_berdiri: 1995,
    telepon: '0821-8899-7744',
    email: 'alikhlas.thamrin@silamas.id',
  },
  {
    id_masjid: 'MSJ-005',
    nama_masjid: 'Masjid Al-Hidayah',
    kelurahan: 'Besusu Barat',
    alamat: 'Jl. Mulawarman No. 1, Besusu Barat, Kota Palu, Sulawesi Tengah',
    latitude: -0.891073,
    longitude: 119.865385,
    kapasitas: 3000,
    kapasitas_teks: 'Sekitar 3.000 jemaah',
    fasilitas_ringkas: 'Kipas angin; TV; Al-Quran; pengeras suara; jam digital; karpet; ambulans; keranda; mikrofon',
    nama_pengurus_utama: 'Arwin M. Lodjowono',
    deskripsi: 'Masjid berdaya tampung besar dengan fasilitas sosial berupa ambulans dan keranda serta perlengkapan ibadah yang lengkap.',
    kata_kunci_foto_google: 'Masjid Al Hidayah Mulawarman Besusu Barat Palu',
    status_foto: 'Foto perlu dipastikan melalui profil lokasi Google',
    sumber_data: 'Tabel GIS.csv; https://idalamat.com/alamat/mesjid-jami-al-hidayah-148568; https://indonesia.worldplaces.me/view-place/84036618-masjid-alhidayah-kel-besusu-barat-kota-palu.html',
    catatan_verifikasi: 'Keberadaan dan alamat jalan dikonfirmasi publik; kapasitas tetap mengikuti data lapangan.',
    skor_rekomendasi: 9.0,
    tahun_berdiri: 1984,
    telepon: '0852-9844-3321',
    email: 'alhidayah.mulawarman@silamas.id',
  },
  {
    id_masjid: 'MSJ-006',
    nama_masjid: 'Masjid Jami Al-Ihsan',
    kelurahan: 'Besusu Timur',
    alamat: 'Jl. Otto Iskandar Dinata No. 60, Besusu Timur, Kota Palu, Sulawesi Tengah',
    latitude: -0.892943,
    longitude: 119.884060,
    kapasitas: 750,
    kapasitas_teks: 'Sekitar 750 jemaah',
    fasilitas_ringkas: 'Pengeras suara; AC; lemari Al-Quran; CCTV; WC; jam digital; kursi untuk orang sakit',
    nama_pengurus_utama: 'Taufik',
    deskripsi: 'Masjid dengan fasilitas aksesibilitas berupa kursi untuk jemaah sakit, dilengkapi AC, CCTV, dan fasilitas ibadah lainnya.',
    kata_kunci_foto_google: 'Masjid Jami Al Ihsan Otto Iskandar Dinata No 60 Palu',
    status_foto: 'Perlu verifikasi visual pada Google Maps',
    sumber_data: 'Tabel GIS.csv',
    catatan_verifikasi: 'Data lengkap dari survei GIS kelompok; foto harus dicocokkan dengan alamat dan koordinat.',
    skor_rekomendasi: 8.8,
    tahun_berdiri: 1991,
    telepon: '0813-5544-6606',
    email: 'jami.alihsan@silamas.id',
  },
  {
    id_masjid: 'MSJ-007',
    nama_masjid: 'Masjid Sabilul Muhtadin',
    kelurahan: 'Besusu Barat',
    alamat: 'Jl. Sam Ratulangi No. 43, Besusu Barat, Kota Palu, Sulawesi Tengah',
    latitude: -0.885435,
    longitude: 119.871709,
    kapasitas: 450,
    kapasitas_teks: 'Sekitar 400-500 jemaah',
    fasilitas_ringkas: 'Tempat wudu; WC; kipas angin; lampu gantung; pengeras suara; mimbar; jam dinding; ambulans',
    nama_pengurus_utama: 'Ustad Husein Abdul Rasyid, S.E.',
    deskripsi: 'Masjid dengan fasilitas ibadah lengkap dan layanan sosial berupa ambulans bagi masyarakat sekitar.',
    kata_kunci_foto_google: 'Masjid Sabilul Muhtadin Sam Ratulangi No 43 Palu',
    status_foto: 'Perlu verifikasi visual pada Google Maps',
    sumber_data: 'Tabel GIS.csv',
    catatan_verifikasi: 'Alamat sangat spesifik dan data fasilitas lengkap; cocok sebagai contoh layanan sosial.',
    skor_rekomendasi: 8.7,
    tahun_berdiri: 1988,
    telepon: '0852-4100-7707',
    email: 'sabilulmuhtadin@silamas.id',
  },
  {
    id_masjid: 'MSJ-008',
    nama_masjid: 'Masjid Al-Istiqamah',
    kelurahan: 'Lolu Selatan',
    alamat: 'Jl. Tanjung Tada, Lolu Selatan, Kota Palu, Sulawesi Tengah',
    latitude: -0.902512,
    longitude: 119.887156,
    kapasitas: 200,
    kapasitas_teks: 'Sekitar 200 jemaah',
    fasilitas_ringkas: 'AC; kipas angin; pengeras suara; Al-Quran; laporan keuangan; jam digital; mikrofon; CCTV; dispenser',
    nama_pengurus_utama: 'Ustad Abdul Rahman',
    deskripsi: 'Masjid dengan fasilitas lengkap dan transparansi laporan keuangan untuk mendukung pelayanan jemaah.',
    kata_kunci_foto_google: 'Masjid Al Istiqamah Jalan Tanjung Tada Lolu Selatan Palu',
    status_foto: 'Lokasi publik ditemukan; foto perlu dicocokkan',
    sumber_data: 'Tabel GIS.csv; https://id.near-place.com/mosque-nearby-masjid-al-istiqamah-jalan-tanjung-tada-lolu-selatan/de',
    catatan_verifikasi: 'Sumber publik menempatkan masjid pada jalan yang sama; koordinat publik berdekatan dengan GIS.',
    skor_rekomendasi: 8.6,
    tahun_berdiri: 1996,
    telepon: '0812-4508-8808',
    email: 'alistiqamah.lolu@silamas.id',
  },
  {
    id_masjid: 'MSJ-009',
    nama_masjid: 'Masjid Al-Haq',
    kelurahan: 'Besusu Tengah',
    alamat: 'Jl. Soeprapto No. 69, Besusu Tengah, Kota Palu, Sulawesi Tengah',
    latitude: -0.889959,
    longitude: 119.875274,
    kapasitas: 1000,
    kapasitas_teks: 'Sekitar 1.000 jemaah',
    fasilitas_ringkas: 'AC; kipas angin; 2 pengeras suara dalam; 4 toa masjid; jam digital; tempat Al-Quran',
    nama_pengurus_utama: 'Hj. Dalil',
    deskripsi: 'Masjid berkapasitas besar di Besusu Tengah dengan sistem pengeras suara dan fasilitas kenyamanan jemaah.',
    kata_kunci_foto_google: 'Masjid Al Haq Soeprapto No 69 Besusu Tengah Palu',
    status_foto: 'Perlu verifikasi visual pada Google Maps',
    sumber_data: 'Tabel GIS.csv',
    catatan_verifikasi: 'Dipilih karena kapasitas besar, alamat spesifik, dan fasilitas cukup lengkap.',
    skor_rekomendasi: 8.4,
    tahun_berdiri: 1990,
    telepon: '0853-4209-9909',
    email: 'alhaq.soeprapto@silamas.id',
  },
  {
    id_masjid: 'MSJ-010',
    nama_masjid: 'Masjid Asy-Syifa',
    kelurahan: 'Besusu Barat',
    alamat: 'Jl. Undata No. 29, Besusu Barat, Kota Palu, Sulawesi Tengah',
    latitude: -0.888705,
    longitude: 119.865287,
    kapasitas: 300,
    kapasitas_teks: 'Sekitar 300 jemaah',
    fasilitas_ringkas: 'Tempat wudu; WC; AC',
    nama_pengurus_utama: 'Ust. Amsal, S.Ag., S.K.M.',
    deskripsi: 'Masjid di Besusu Barat dengan fasilitas dasar yang terawat untuk kenyamanan beribadah.',
    kata_kunci_foto_google: 'Masjid Asy Syifa Undata No 29 Besusu Barat Palu',
    status_foto: 'Perlu verifikasi visual pada Google Maps',
    sumber_data: 'Tabel GIS.csv',
    catatan_verifikasi: 'Dipilih karena alamat, koordinat, kapasitas, dan nama pengurus tercatat lengkap.',
    skor_rekomendasi: 8.2,
    tahun_berdiri: 1994,
    telepon: '0811-4510-1010',
    email: 'asysyifa.undata@silamas.id',
  },
];

function capitalizeFirst(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function getInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const pengurusPasswordHash = bcrypt.hashSync('pengurus123', salt);

  // Menyusun daftar fasilitas berdasarkan rincian fasilitas pada data CSV
  const generatedFasilitas: Fasilitas[] = [];
  let fasCounter = 1;

  VERIFIED_10_MASJIDS.forEach((m) => {
    const items = m.fasilitas_ringkas
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    items.forEach((rawName) => {
      const lower = rawName.toLowerCase();
      const bisaDipinjam =
        lower.includes('ambulans') ||
        lower.includes('keranda') ||
        lower.includes('pengeras suara') ||
        lower.includes('mikrofon') ||
        lower.includes('papan tulis') ||
        lower.includes('kursi') ||
        lower.includes('karpet') ||
        lower.includes('atm beras');

      let jumlah = 1;
      if (lower.startsWith('2 ')) jumlah = 2;
      else if (lower.startsWith('4 ')) jumlah = 4;
      else if (lower.includes('kipas angin') || lower.includes('ac')) jumlah = 6;
      else if (lower.includes('karpet')) jumlah = 12;

      generatedFasilitas.push({
        id_fasilitas: `FAS-${String(fasCounter++).padStart(3, '0')}`,
        id_masjid: m.id_masjid,
        nama_fasilitas: capitalizeFirst(rawName),
        jumlah,
        kondisi: 'Baik',
        keterangan: `Fasilitas tercatat dari data survei lapangan & GIS pada ${m.nama_masjid} (${m.kelurahan}).`,
        bisa_dipinjam: bisaDipinjam,
        created_at: '2026-01-10T08:00:00.000Z',
        updated_at: '2026-01-10T08:00:00.000Z',
      });
    });
  });

  // Menyusun daftar pengurus berdasarkan nama pengurus utama pada data CSV
  const generatedPengurus: Pengurus[] = [];
  let pgrCounter = 1;
  VERIFIED_10_MASJIDS.forEach((m) => {
    if (m.nama_pengurus_utama && m.nama_pengurus_utama.toLowerCase() !== 'belum tercatat') {
      generatedPengurus.push({
        id_pengurus: `PGR-${String(pgrCounter++).padStart(3, '0')}`,
        id_masjid: m.id_masjid,
        nama_pengurus: m.nama_pengurus_utama,
        jabatan: 'Ketua / Pengurus Utama Masjid',
        kontak: m.telepon !== '-' ? m.telepon : 'Belum tercatat',
        periode: '2024 - 2027',
        email: m.email,
        created_at: '2026-01-10T08:00:00.000Z',
        updated_at: '2026-01-10T08:00:00.000Z',
      });
    }
  });

  return {
    schema_version: 2,
    users: [
      {
        id_user: 'USR-001',
        nama: 'Administrator Utama SILAMAS',
        username: 'admin',
        password_hash: adminPasswordHash,
        role: 'admin',
        id_masjid: null,
        status_akun: 'Aktif',
        created_at: '2026-01-10T08:00:00.000Z',
        updated_at: '2026-01-10T08:00:00.000Z',
      },
      {
        id_user: 'USR-002',
        nama: 'Ammuh (Pengurus Masjid Agung Baiturrahim)',
        username: 'pengurus',
        password_hash: pengurusPasswordHash,
        role: 'pengurus',
        id_masjid: 'MSJ-001',
        status_akun: 'Aktif',
        created_at: '2026-01-15T09:00:00.000Z',
        updated_at: '2026-01-15T09:00:00.000Z',
      },
      {
        id_user: 'USR-003',
        nama: 'Arwin M. Lodjowono (Pengurus Masjid Al-Hidayah)',
        username: 'pengurus_besusu',
        password_hash: pengurusPasswordHash,
        role: 'pengurus',
        id_masjid: 'MSJ-005',
        status_akun: 'Aktif',
        created_at: '2026-01-20T10:00:00.000Z',
        updated_at: '2026-01-20T10:00:00.000Z',
      },
    ],
    masjids: VERIFIED_10_MASJIDS.map((m) => ({
      id_masjid: m.id_masjid,
      nama_masjid: m.nama_masjid,
      alamat: m.alamat,
      kelurahan: m.kelurahan,
      kecamatan: 'Wilayah Terdaftar',
      latitude: m.latitude,
      longitude: m.longitude,
      kapasitas: m.kapasitas,
      kapasitas_teks: m.kapasitas_teks,
      fasilitas_ringkas: m.fasilitas_ringkas,
      nama_pengurus_utama: m.nama_pengurus_utama,
      tahun_berdiri: m.tahun_berdiri,
      deskripsi: m.deskripsi,
      telepon: m.telepon,
      email: m.email,
      luas_tanah: 'Belum tercatat',
      status_tanah: 'Belum diverifikasi',
      foto_url: '',
      kata_kunci_foto_google: m.kata_kunci_foto_google,
      status_foto: m.status_foto,
      sumber_data: m.sumber_data,
      catatan_verifikasi: m.catatan_verifikasi,
      skor_rekomendasi: m.skor_rekomendasi,
      status_verifikasi: m.skor_rekomendasi >= 9.0 ? 'Terverifikasi' : 'Perlu Verifikasi',
      created_at: '2026-01-05T08:00:00.000Z',
      updated_at: '2026-01-05T08:00:00.000Z',
    })),
    fasilitas: generatedFasilitas,
    pengurus: generatedPengurus,
    kegiatan: [
      {
        id_kegiatan: 'KGT-001',
        id_masjid: 'MSJ-001',
        nama_kegiatan: 'Kajian Rutin Ahad Subuh & Silaturahmi Jemaah',
        tanggal: '2026-10-11',
        waktu: '05:00 - 06:45 WITA',
        penceramah: 'Ustadz Pembina Masjid Agung Baiturrahim',
        lokasi: 'Ruang Ibadah Utama Masjid Agung Baiturrahim',
        keterangan: 'Kajian tafsir Al-Quran dan diskusi keislaman terbuka untuk seluruh masyarakat.',
        status: 'Akan Datang',
        created_at: '2026-01-10T08:00:00.000Z',
        updated_at: '2026-01-10T08:00:00.000Z',
      },
      {
        id_kegiatan: 'KGT-002',
        id_masjid: 'MSJ-002',
        nama_kegiatan: 'Penyaluran Layanan Sosial ATM Beras bagi Warga Membutuhkan',
        tanggal: '2026-10-12',
        waktu: '08:30 - 11:30 WITA',
        penceramah: 'Pengurus Masjid Al-Munawwarah',
        lokasi: 'Serambi Masjid Al-Munawwarah, Jl. R.A. Kartini No. 80',
        keterangan: 'Layanan pembagian beras melalui fasilitas ATM beras bagi keluarga prasejahtera dan lansia.',
        status: 'Akan Datang',
        created_at: '2026-01-10T08:00:00.000Z',
        updated_at: '2026-01-10T08:00:00.000Z',
      },
      {
        id_kegiatan: 'KGT-003',
        id_masjid: 'MSJ-003',
        nama_kegiatan: 'Kelas Bimbingan Belajar Baca Tulis Al-Quran & Kajian Buku',
        tanggal: '2026-10-15',
        waktu: '16:00 - 17:30 WITA',
        penceramah: 'Tim Pengajar Masjid Darul Arqam',
        lokasi: 'Masjid Darul Arqam, Jl. Sultan Hasanuddin No. 62',
        keterangan: 'Pembelajaran membaca Al-Quran menggunakan fasilitas papan tulis dan koleksi buku perpustakaan masjid.',
        status: 'Akan Datang',
        created_at: '2026-01-11T08:00:00.000Z',
        updated_at: '2026-01-11T08:00:00.000Z',
      },
      {
        id_kegiatan: 'KGT-004',
        id_masjid: 'MSJ-005',
        nama_kegiatan: 'Kajian Malam Jumat & Koordinasi Layanan Sosial Ambulans',
        tanggal: '2026-10-18',
        waktu: '19:30 - 21:00 WITA',
        penceramah: 'Pengurus Masjid Al-Hidayah',
        lokasi: 'Masjid Al-Hidayah, Jl. Mulawarman No. 1',
        keterangan: 'Pengajian rutin jemaah sekaligus sosialisasi layanan ambulans dan keranda untuk warga.',
        status: 'Akan Datang',
        created_at: '2026-01-12T08:00:00.000Z',
        updated_at: '2026-01-12T08:00:00.000Z',
      },
    ],
    pengumuman: [
      {
        id_pengumuman: 'PGM-001',
        id_masjid: 'MSJ-001',
        judul: 'Informasi Layanan Peminjaman Perlengkapan & Fasilitas Masjid Agung Baiturrahim',
        isi: 'Masyarakat dan jemaah dapat mengajukan peminjaman perlengkapan masjid secara tertib melalui menu Pinjam Fasilitas pada sistem SILAMAS.',
        tanggal: '2026-10-01',
        penulis: 'Pengurus Masjid Agung Baiturrahim',
        kategori: 'Umum',
        created_at: '2026-10-01T08:00:00.000Z',
        updated_at: '2026-10-01T08:00:00.000Z',
      },
      {
        id_pengumuman: 'PGM-002',
        id_masjid: 'MSJ-008',
        judul: 'Transparansi Laporan Kas & Infaq Jemaah Masjid Al-Istiqamah',
        isi: 'Laporan pemasukan dan pengeluaran kas infaq jemaah diperbarui secara berkala pada papan informasi keuangan dan sistem informasi masjid.',
        tanggal: '2026-10-03',
        penulis: 'Ustad Abdul Rahman',
        kategori: 'Keuangan',
        created_at: '2026-10-03T08:00:00.000Z',
        updated_at: '2026-10-03T08:00:00.000Z',
      },
      {
        id_pengumuman: 'PGM-003',
        id_masjid: 'MSJ-005',
        judul: 'Siaga Layanan Ambulans & Keranda Jenazah Masjid Al-Hidayah',
        isi: 'Warga yang memerlukan bantuan ambulans atau keranda jenazah dapat mengajukan permohonan melalui menu Layanan Jemaah atau menghubungi pengurus Masjid Al-Hidayah.',
        tanggal: '2026-10-04',
        penulis: 'Arwin M. Lodjowono',
        kategori: 'Umum',
        created_at: '2026-10-04T08:00:00.000Z',
        updated_at: '2026-10-04T08:00:00.000Z',
      },
    ],
    peminjaman: [
      {
        id_peminjaman: 'PMJ-001',
        kode_pelacakan: 'TRK-PMJ-2026-001',
        id_masjid: 'MSJ-001',
        id_fasilitas: 'FAS-008',
        nama_pemohon: 'Muhammad Fadhil Ramadhan',
        nik_pemohon: '7271031405950001',
        kontak_pemohon: '0812-4455-6677',
        email_pemohon: 'fadhil.ramadhan@gmail.com',
        alamat_pemohon: 'Jl. R.A. Kartini No. 12, Lolu Utara',
        tanggal_mulai: '2026-10-25',
        tanggal_selesai: '2026-10-25',
        waktu_mulai: '08:00 WITA',
        waktu_selesai: '14:00 WITA',
        tujuan_peminjaman: 'Peminjaman karpet tambahan untuk kegiatan pengajian dan doa bersama keluarga.',
        status: 'Disetujui',
        catatan_petugas: 'Permohonan disetujui. Silakan berkoordinasi dengan pengurus Masjid Agung Baiturrahim sehari sebelum kegiatan.',
        created_at: '2026-10-02T09:15:00.000Z',
        updated_at: '2026-10-03T11:00:00.000Z',
      },
      {
        id_peminjaman: 'PMJ-002',
        kode_pelacakan: 'TRK-PMJ-2026-002',
        id_masjid: 'MSJ-005',
        id_fasilitas: 'FAS-037',
        nama_pemohon: 'Ibu Ratna Dewi, S.Pd',
        nik_pemohon: '7271035208880002',
        kontak_pemohon: '0852-1122-3344',
        email_pemohon: 'ratna.dewi@gmail.com',
        alamat_pemohon: 'Jl. Sam Ratulangi Lrg. 4, Besusu Barat',
        tanggal_mulai: '2026-10-18',
        tanggal_selesai: '2026-10-18',
        waktu_mulai: '09:00 WITA',
        waktu_selesai: '15:00 WITA',
        tujuan_peminjaman: 'Peminjaman mikrofon dan pengeras suara untuk kegiatan pengajian majelis taklim ibu-ibu.',
        status: 'Menunggu Verifikasi',
        catatan_petugas: 'Pengajuan telah diterima dan sedang menunggu pemeriksaan jadwal ketersediaan alat oleh pengurus.',
        created_at: '2026-10-05T14:30:00.000Z',
        updated_at: '2026-10-05T14:30:00.000Z',
      },
    ],
    layanan: [
      {
        id_layanan: 'LYN-001',
        kode_pelacakan: 'TRK-LYN-2026-001',
        id_masjid: 'MSJ-007',
        jenis_layanan: 'Layanan Pengurusan & Mobil Ambulans Jenazah',
        nama_pemohon: 'Keluarga Bpk. H. Sudirman',
        nik_pemohon: '7271031102600004',
        kontak_pemohon: '0813-8877-6655',
        alamat_pemohon: 'Jl. Sam Ratulangi, Besusu Barat',
        rincian_kebutuhan: 'Permohonan bantuan mobil ambulans Masjid Sabilul Muhtadin untuk pengantaran jenazah keluarga.',
        status: 'Selesai',
        catatan_petugas: 'Layanan ambulans telah selesai dilaksanakan dengan baik oleh petugas Masjid Sabilul Muhtadin.',
        created_at: '2026-10-04T07:20:00.000Z',
        updated_at: '2026-10-04T12:00:00.000Z',
      },
      {
        id_layanan: 'LYN-002',
        kode_pelacakan: 'TRK-LYN-2026-002',
        id_masjid: 'MSJ-002',
        jenis_layanan: 'Penyaluran Bantuan Zakat, Infaq, Sedekah (ZIS) / Mustahik',
        nama_pemohon: 'Bpk. Rahmat Hidayat',
        nik_pemohon: '7271032506990003',
        kontak_pemohon: '0821-3344-5566',
        alamat_pemohon: 'Jl. R.A. Kartini, Lolu Selatan',
        rincian_kebutuhan: 'Permohonan pendaftaran penerima manfaat layanan sosial ATM beras di Masjid Al-Munawwarah bagi lansia.',
        status: 'Diproses',
        catatan_petugas: 'Data pemohon sedang diperiksa oleh pengurus Masjid Al-Munawwarah untuk jadwal penyaluran pekan ini.',
        created_at: '2026-10-05T10:00:00.000Z',
        updated_at: '2026-10-05T16:00:00.000Z',
      },
    ],
    riwayat: [
      {
        id_riwayat: 'RWY-001',
        kode_pelacakan: 'TRK-PMJ-2026-001',
        status: 'Menunggu Verifikasi',
        catatan: 'Permohonan peminjaman fasilitas berhasil dikirim melalui sistem SILAMAS.',
        petugas: 'Sistem SILAMAS',
        timestamp: '2026-10-02T09:15:00.000Z',
      },
      {
        id_riwayat: 'RWY-002',
        kode_pelacakan: 'TRK-PMJ-2026-001',
        status: 'Diproses',
        catatan: 'Pemeriksaan jadwal dan ketersediaan perlengkapan selesai dilakukan.',
        petugas: 'Ammuh (Pengurus Masjid Agung Baiturrahim)',
        timestamp: '2026-10-03T10:30:00.000Z',
      },
      {
        id_riwayat: 'RWY-003',
        kode_pelacakan: 'TRK-PMJ-2026-001',
        status: 'Disetujui',
        catatan: 'Permohonan disetujui. Pemohon dapat mengambil perlengkapan sesuai jadwal.',
        petugas: 'Ammuh (Pengurus Masjid Agung Baiturrahim)',
        timestamp: '2026-10-03T11:00:00.000Z',
      },
      {
        id_riwayat: 'RWY-004',
        kode_pelacakan: 'TRK-PMJ-2026-002',
        status: 'Menunggu Verifikasi',
        catatan: 'Pengajuan peminjaman perlengkapan diterima oleh sistem SILAMAS.',
        petugas: 'Sistem SILAMAS',
        timestamp: '2026-10-05T14:30:00.000Z',
      },
      {
        id_riwayat: 'RWY-005',
        kode_pelacakan: 'TRK-LYN-2026-001',
        status: 'Menunggu Verifikasi',
        catatan: 'Pengajuan layanan ambulans diterima.',
        petugas: 'Sistem SILAMAS',
        timestamp: '2026-10-04T07:20:00.000Z',
      },
      {
        id_riwayat: 'RWY-006',
        kode_pelacakan: 'TRK-LYN-2026-001',
        status: 'Disetujui',
        catatan: 'Disetujui dan petugas ambulans Masjid Sabilul Muhtadin segera diberangkatkan.',
        petugas: 'Ustad Husein Abdul Rasyid, S.E.',
        timestamp: '2026-10-04T07:35:00.000Z',
      },
      {
        id_riwayat: 'RWY-007',
        kode_pelacakan: 'TRK-LYN-2026-001',
        status: 'Selesai',
        catatan: 'Pelayanan pengantaran ambulans telah selesai dengan lancar.',
        petugas: 'Ustad Husein Abdul Rasyid, S.E.',
        timestamp: '2026-10-04T12:00:00.000Z',
      },
      {
        id_riwayat: 'RWY-008',
        kode_pelacakan: 'TRK-LYN-2026-002',
        status: 'Menunggu Verifikasi',
        catatan: 'Formulir permohonan layanan sosial ATM beras berhasil dikirim.',
        petugas: 'Sistem SILAMAS',
        timestamp: '2026-10-05T10:00:00.000Z',
      },
      {
        id_riwayat: 'RWY-009',
        kode_pelacakan: 'TRK-LYN-2026-002',
        status: 'Diproses',
        catatan: 'Pengurus sedang memverifikasi data penerima manfaat layanan ATM beras.',
        petugas: 'Muktar Ibnu Masud',
        timestamp: '2026-10-05T16:00:00.000Z',
      },
    ],
  };
}
