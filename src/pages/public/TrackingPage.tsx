/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { PeminjamanItem, LayananItem } from '../../types/index.js';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  User,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface TrackingPageProps {
  initialCode?: string;
}

type TrackedRecord =
  | { type: 'Peminjaman Perlengkapan & Fasilitas Masjid'; item: PeminjamanItem }
  | { type: 'Permohonan Layanan Jemaah'; item: LayananItem };

export const TrackingPage: React.FC<TrackingPageProps> = ({ initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackedRecord | null>(null);

  const fetchTracking = useCallback(async (searchCode: string) => {
    const trimmed = searchCode.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      if (trimmed.includes('LYN')) {
        const l = await api.trackLayanan(trimmed);
        setResult({ type: 'Permohonan Layanan Jemaah', item: l });
      } else if (trimmed.includes('PMJ')) {
        const p = await api.trackPeminjaman(trimmed);
        setResult({ type: 'Peminjaman Perlengkapan & Fasilitas Masjid', item: p });
      } else {
        try {
          const p = await api.trackPeminjaman(trimmed);
          setResult({ type: 'Peminjaman Perlengkapan & Fasilitas Masjid', item: p });
        } catch {
          const l = await api.trackLayanan(trimmed);
          setResult({ type: 'Permohonan Layanan Jemaah', item: l });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Kode pengajuan tidak ditemukan. Pastikan kode yang dimasukkan sudah benar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      fetchTracking(initialCode);
    }
  }, [initialCode, fetchTracking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(code);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Diproses':
      case 'Menunggu Verifikasi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Ditolak':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kepala Halaman & Kolom Pencarian Kode Pengajuan */}
        <div className="bg-emerald-950 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-800/70 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Search className="w-4 h-4" /> Transparansi Layanan Umat
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Cek Status Pengajuan Anda
          </h1>
          <p className="text-emerald-100/80 text-sm mb-6 max-w-2xl">
            Masukkan <strong>Kode Pengajuan</strong> yang Anda terima saat mengirim formulir peminjaman perlengkapan atau permohonan layanan jemaah untuk melihat perkembangan persetujuan pengurus masjid.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Masukkan Kode Pengajuan Anda di sini..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm transition-colors shrink-0 shadow-md"
            >
              {loading ? 'Mencari...' : 'Periksa Status'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-white rounded-2xl p-6 border border-rose-200 text-center shadow-sm mb-8">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 mb-1">Data Pengajuan Tidak Ditemukan</h3>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Kartu Ringkasan Status Pengajuan */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    {result.type}
                  </span>
                  <h2 className="font-mono text-2xl font-bold text-slate-900">
                    {result.item.kode_pelacakan}
                  </h2>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${getStatusBadge(
                    result.item.status
                  )}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Status Saat Ini: {result.item.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400">Masjid Tujuan</p>
                      <p className="font-bold text-slate-900">{result.item.nama_masjid}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400">Nama Pemohon</p>
                      <p className="font-semibold text-slate-800">{result.item.nama_pemohon}</p>
                      <p className="text-xs text-slate-500">Kontak: {result.item.kontak_pemohon}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {'id_peminjaman' in result.item ? (
                    <>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-slate-400">Perlengkapan & Keperluan</p>
                          <p className="font-bold text-slate-900">{result.item.nama_fasilitas}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Keperluan: {result.item.tujuan_peminjaman}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-slate-400">Jadwal Peminjaman</p>
                          <p className="font-semibold text-slate-800">
                            {result.item.tanggal_mulai} s/d {result.item.tanggal_selesai} (
                            {result.item.waktu_mulai} - {result.item.waktu_selesai})
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-slate-400">Kategori Layanan Jemaah</p>
                          <p className="font-bold text-slate-900">{result.item.jenis_layanan}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {result.item.rincian_kebutuhan}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {result.item.catatan_petugas && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Keterangan / Tindak Lanjut Pengurus Masjid:
                    </p>
                    <p className="text-sm text-emerald-950 mt-0.5">{result.item.catatan_petugas}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Riwayat Tahapan Pemeriksaan */}
            {result.item.timeline && result.item.timeline.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-800" /> Riwayat Pemeriksaan & Tindak Lanjut Pengurus
                </h3>

                <div className="relative pl-6 border-l-2 border-emerald-200 space-y-6">
                  {result.item.timeline.map((log, idx) => (
                    <div key={log.id_riwayat} className="relative">
                      <span
                        className={`w-3.5 h-3.5 rounded-full absolute -left-[31px] top-1.5 border-2 border-white ${
                          idx === (result.item.timeline?.length || 0) - 1
                            ? 'bg-emerald-700 ring-4 ring-emerald-100'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-sm text-emerald-950">{log.status}</span>
                          <span className="text-xs font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-1.5">{log.catatan}</p>
                        <p className="text-xs text-slate-400">Petugas Pencatat: {log.petugas}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
