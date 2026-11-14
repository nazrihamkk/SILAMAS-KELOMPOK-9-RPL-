/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { DashboardStats, PeminjamanItem, LayananItem } from '../../types/index.js';
import {
  Building2,
  Package,
  Users,
  Calendar,
  ClipboardCheck,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  FileBarChart,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateModule: (mod: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateModule }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanItem[]>([]);
  const [layananList, setLayananList] = useState<LayananItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const masjidFilter = user?.role === 'pengurus' && user.id_masjid ? user.id_masjid : undefined;
        const [st, pmj, lyn] = await Promise.all([
          api.getStats(masjidFilter),
          api.getPeminjaman({ id_masjid: masjidFilter }),
          api.getLayanan({ id_masjid: masjidFilter }),
        ]);
        setStats(st);
        setPeminjamanList(pmj);
        setLayananList(lyn);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Memuat ringkasan data sistem SILAMAS...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Kartu Statistik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateModule('masjid')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Masjid Terdaftar
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats?.totalMasjid || 0}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              ± {(stats?.totalKapasitas || 0).toLocaleString('id-ID')} kapasitas jemaah
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateModule('fasilitas')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Perlengkapan & Fasilitas
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats?.totalFasilitas || 0}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {stats?.fasilitasKondisi.baik || 0} kondisi baik & siap pakai
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateModule('pengurus')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pengurus & Kegiatan
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats?.totalPengurus || 0}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {stats?.totalKegiatan || 0} agenda
              </span>
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Struktur pengurus & jadwal dakwah
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateModule('laporan')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pusat Ringkasan Data
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              Cetak & Unduh
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Ringkasan PDF, CSV & TXT
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <FileBarChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Daftar Permohonan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permohonan Peminjaman Fasilitas */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <ClipboardCheck className="w-5 h-5 text-emerald-800" />
              <h2 className="font-bold text-slate-900">Permohonan Pinjam Fasilitas Terbaru</h2>
            </div>
            <button
              onClick={() => onNavigateModule('peminjaman')}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              Kelola Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {peminjamanList.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Belum ada permohonan peminjaman fasilitas.
            </p>
          ) : (
            <div className="space-y-3">
              {peminjamanList.slice(0, 4).map((p) => (
                <div
                  key={p.id_peminjaman}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800">
                        {p.kode_pelacakan}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {p.nama_pemohon}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {p.nama_fasilitas} — {p.nama_masjid}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                      p.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Menunggu Verifikasi'
                        ? 'bg-amber-100 text-amber-800'
                        : p.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(stats?.pendingPeminjaman || 0) > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Terdapat <strong>{stats?.pendingPeminjaman} permohonan peminjaman</strong> yang
                menunggu pemeriksaan pengurus.
              </span>
            </div>
          )}
        </div>

        {/* Permohonan Layanan Jemaah */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="w-5 h-5 text-emerald-800" />
              <h2 className="font-bold text-slate-900">Permohonan Layanan Jemaah Terbaru</h2>
            </div>
            <button
              onClick={() => onNavigateModule('layanan')}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              Kelola Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {layananList.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Belum ada permohonan layanan jemaah.
            </p>
          ) : (
            <div className="space-y-3">
              {layananList.slice(0, 4).map((l) => (
                <div
                  key={l.id_layanan}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800">
                        {l.kode_pelacakan}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {l.nama_pemohon}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {l.jenis_layanan} — {l.nama_masjid}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                      l.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'Diproses' || l.status === 'Menunggu Verifikasi'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(stats?.pendingLayanan || 0) > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Terdapat <strong>{stats?.pendingLayanan} layanan jemaah</strong> yang sedang
                menunggu tindak lanjut pengurus.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
