/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api.js';
import { MasjidItem, DashboardStats, KegiatanItem, PengumumanItem } from '../../types/index.js';
import { MosqueCard } from '../../components/MosqueCard.js';
import { Search, MapPin, Building2, Calendar, FileText, ArrowRight, Clock } from 'lucide-react';

interface Props {
  onNavigateMasjid: (id: string) => void;
  onNavigatePeminjaman: (id_masjid?: string) => void;
  onNavigateLayanan: (id_masjid?: string) => void;
  onNavigateTracking: (code?: string) => void;
  onNavigateDirektori: () => void;
}

export const HomePage: React.FC<Props> = ({
  onNavigateMasjid,
  onNavigatePeminjaman,
  onNavigateLayanan,
  onNavigateTracking,
  onNavigateDirektori,
}) => {
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kegiatan, setKegiatan] = useState<KegiatanItem[]>([]);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelurahan, setSelectedKelurahan] = useState('Semua');
  const [quickTrackingCode, setQuickTrackingCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [masjidRes, statsRes, kegiatanRes, pengumumanRes] = await Promise.all([
          api.getMasjids(),
          api.getStats(),
          api.getKegiatan({ status: 'Akan Datang' }),
          api.getPengumuman(),
        ]);
        setMasjids(masjidRes);
        setStats(statsRes);
        setKegiatan(kegiatanRes);
        setPengumuman(pengumumanRes);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const kelurahanList = useMemo(() => {
    const unique = Array.from(new Set(masjids.map((m) => m.kelurahan).filter(Boolean)));
    return ['Semua', ...unique];
  }, [masjids]);

  const filteredMasjids = masjids.filter((m) => {
    const matchKelurahan =
      selectedKelurahan === 'Semua' || m.kelurahan.toLowerCase() === selectedKelurahan.toLowerCase();
    const matchQuery =
      searchQuery === '' ||
      m.nama_masjid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.kelurahan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelurahan && matchQuery;
  });

  return (
    <div className="space-y-14 pb-16">
      {/* 1. Bagian Utama (Hero) */}
      <section className="relative bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-medium">
            <span>Sistem Informasi Masjid</span>
            <span aria-hidden="true">·</span>
            <span>SILAMAS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl mx-auto text-balance">
            Transparansi Data & Kemudahan Layanan Umat
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Portal informasi masjid untuk melihat daftar masjid, perlengkapan fasilitas, jadwal kegiatan ibadah, serta mengajukan peminjaman fasilitas dan layanan jemaah dengan mudah.
          </p>

          {/* Kolom Pencarian Cepat Kode Pengajuan */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 px-3 flex-1 w-full">
                <Search className="w-4 h-4 text-emerald-300 shrink-0" />
                <input
                  type="text"
                  placeholder="Masukkan Kode Pengajuan Anda..."
                  value={quickTrackingCode}
                  onChange={(e) => setQuickTrackingCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && quickTrackingCode.trim()) {
                      onNavigateTracking(quickTrackingCode.trim());
                    }
                  }}
                  className="bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm w-full focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => {
                  if (quickTrackingCode.trim()) {
                    onNavigateTracking(quickTrackingCode.trim());
                  } else {
                    onNavigateTracking();
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                Cek Status Pengajuan
              </button>
            </div>
          </div>
        </div>

        {/* Baris Ringkasan Statistik */}
        {stats && (
          <div className="max-w-6xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
              <span className="text-xs text-slate-400 block">Masjid Terdaftar</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.totalMasjid}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-1">Wilayah Terdaftar</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
              <span className="text-xs text-slate-400 block">Daya Tampung Jemaah</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.totalKapasitas.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-1">Kapasitas Jemaah</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
              <span className="text-xs text-slate-400 block">Perlengkapan & Fasilitas</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.totalFasilitas}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-1">Sarana Tercatat</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
              <span className="text-xs text-slate-400 block">Pelayanan Jemaah</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.peminjamanStatus.selesai + stats.totalLayanan}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-1">Pengajuan Dilayani</span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Kartu Akses Layanan Cepat */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Daftar Masjid</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lihat informasi lengkap alamat, pengurus masjid, kapasitas jemaah, perlengkapan fasilitas, serta peta lokasi masjid.
              </p>
            </div>
            <button
              onClick={onNavigateDirektori}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>Lihat Daftar Masjid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Pinjam Fasilitas Masjid</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ajukan peminjaman perlengkapan ibadah, karpet, pengeras suara, kursi, ambulans, atau ruang kegiatan masjid dengan mudah.
              </p>
            </div>
            <button
              onClick={() => onNavigatePeminjaman()}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              <span>Ajukan Peminjaman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Layanan Sosial Jemaah</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Layanan bantuan ambulans dan pengurusan jenazah, konsultasi ibadah, bimbingan mualaf, serta penyaluran bantuan sosial.
              </p>
            </div>
            <button
              onClick={() => onNavigateLayanan()}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
            >
              <span>Ajukan Layanan Jemaah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Bagian Daftar Masjid Terdaftar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase block">
              Sistem Informasi Masjid
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Masjid Terdaftar
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Informasi profil, kapasitas, fasilitas, pengurus masjid, dan lokasi peta yang telah terdata.
            </p>
          </div>

          {/* Kolom Pencarian Masjid */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau alamat masjid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tombol Filter Wilayah/Kelurahan */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {kelurahanList.map((kel) => (
            <button
              key={kel}
              onClick={() => setSelectedKelurahan(kel)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedKelurahan === kel
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {kel === 'Semua' ? 'Semua Wilayah' : `Kel. ${kel}`}
            </button>
          ))}
        </div>

        {/* Daftar Kartu Masjid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : filteredMasjids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMasjids.slice(0, 6).map((m) => (
              <MosqueCard
                key={m.id_masjid}
                masjid={m}
                onSelect={onNavigateMasjid}
                onPinjam={onNavigatePeminjaman}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada masjid yang cocok</p>
            <p className="text-xs text-slate-500 mt-1">Silakan gunakan kata kunci lain atau pilih semua wilayah.</p>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onNavigateDirektori}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
          >
            <span>Lihat Semua Daftar Masjid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4. Jadwal Kegiatan & Pengumuman */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kegiatan Terdekat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Jadwal Kegiatan & Pengajian Terdekat</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Wilayah Terdaftar</span>
            </div>

            <div className="space-y-3">
              {kegiatan.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">Belum ada jadwal kegiatan mendatang yang terdaftar.</p>
              ) : (
                kegiatan.slice(0, 3).map((kgt) => (
                  <div key={kgt.id_kegiatan} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{kgt.nama_kegiatan}</h4>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        {kgt.tanggal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{kgt.keterangan}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" /> {kgt.waktu}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" /> {kgt.nama_masjid || kgt.lokasi}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pengumuman Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Pengumuman & Informasi Masjid</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Informasi Jemaah</span>
            </div>

            <div className="space-y-3">
              {pengumuman.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">Belum ada pengumuman aktif.</p>
              ) : (
                pengumuman.slice(0, 3).map((pgm) => (
                  <div key={pgm.id_pengumuman} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{pgm.judul}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{pgm.tanggal}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{pgm.isi}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <span>Disampaikan oleh: <strong className="text-slate-700">{pgm.penulis}</strong></span>
                      <span className="mx-2">·</span>
                      <span>{pgm.nama_masjid}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Informasi Alur Pelayanan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-8 shadow-sm">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Langkah Mudah Layanan SILAMAS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Pelayanan Jelas dan Mudah Dipantau oleh Seluruh Masyarakat
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Setiap pengajuan peminjaman fasilitas maupun layanan sosial masjid mendapatkan kode pengajuan unik. Masyarakat dapat mengecek perkembangan pengajuan kapan saja tanpa harus bolak-balik.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="font-mono text-emerald-300 font-bold block mb-1">01. Isi Formulir</span>
              <p className="text-slate-300">Jemaah mengisi formulir pengajuan dan menyimpan kode pengajuan.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="font-mono text-emerald-300 font-bold block mb-1">02. Pemeriksaan Pengurus</span>
              <p className="text-slate-300">Pengurus masjid memeriksa jadwal ketersediaan perlengkapan atau petugas.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="font-mono text-emerald-300 font-bold block mb-1">03. Konfirmasi & Catatan</span>
              <p className="text-slate-300">Pengurus memberikan persetujuan beserta keterangan tindak lanjut.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="font-mono text-emerald-300 font-bold block mb-1">04. Cek Status Online</span>
              <p className="text-slate-300">Jemaah cukup memasukkan kode pengajuan pada menu Cek Status Pengajuan.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
