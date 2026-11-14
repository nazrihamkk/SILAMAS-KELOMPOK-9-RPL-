import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { PeminjamanItem, StatusPengajuan } from '../../types/index.js';
import { Search, FolderSync, CheckCircle2, Clock, XCircle, Edit3, X, AlertCircle } from 'lucide-react';

export const AdminPeminjamanPage: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<PeminjamanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedItem, setSelectedItem] = useState<PeminjamanItem | null>(null);
  const [newStatus, setNewStatus] = useState<StatusPengajuan>('Disetujui');
  const [petugasCatatan, setPetugasCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const data = await api.getPeminjaman({ id_masjid: user?.id_masjid || undefined });
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openActionModal = (item: PeminjamanItem) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setPetugasCatatan(item.catatan_petugas || '');
    setErrorMsg('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.updateStatusPeminjaman(selectedItem.id_peminjaman, newStatus, petugasCatatan);
      setSelectedItem(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = list.filter((p) => {
    if (filterStatus !== 'all' && p.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (
      search &&
      !p.nama_pemohon.toLowerCase().includes(search.toLowerCase()) &&
      !p.kode_pelacakan.toLowerCase().includes(search.toLowerCase()) &&
      !p.tujuan_peminjaman.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Bagian Judul Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pemeriksaan Peminjaman Perlengkapan & Fasilitas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan dan persetujuan permohonan pinjam perlengkapan serta fasilitas masjid oleh jemaah.
          </p>
        </div>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode pengajuan, nama pemohon, atau keperluan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Semua Status</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Selesai">Selesai</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>

      {/* Tabel Permohonan Peminjaman */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode Pengajuan</th>
                <th className="py-3 px-4">Nama Pemohon</th>
                <th className="py-3 px-4">Masjid & Fasilitas</th>
                <th className="py-3 px-4">Tanggal Pakai</th>
                <th className="py-3 px-4">Maksud / Tujuan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id_peminjaman} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{p.kode_pelacakan}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{p.nama_pemohon}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{p.kontak_pemohon}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-semibold text-slate-900">{p.nama_fasilitas}</div>
                    <div className="text-[11px] text-slate-500">{p.nama_masjid}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-900">{p.tanggal_mulai}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">{p.waktu_mulai}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{p.tujuan_peminjaman}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === 'Disetujui'
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.status === 'Selesai'
                          ? 'bg-teal-50 text-teal-800'
                          : p.status === 'Ditolak'
                          ? 'bg-rose-50 text-rose-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openActionModal(p)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Verifikasi</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada berkas permohonan peminjaman yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jendela Pemeriksaan & Verifikasi */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-700 font-bold block">
                  {selectedItem.kode_pelacakan}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Pemeriksaan & Tindak Lanjut Peminjaman
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Ringkasan Data Pemohon */}
              <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100">
                <p>Pemohon: <strong className="text-slate-900">{selectedItem.nama_pemohon}</strong> ({selectedItem.kontak_pemohon})</p>
                <p>Fasilitas: <strong className="text-slate-900">{selectedItem.nama_fasilitas}</strong> · {selectedItem.nama_masjid}</p>
                <p>Waktu: <span className="font-mono">{selectedItem.tanggal_mulai}</span> ({selectedItem.waktu_mulai} - {selectedItem.waktu_selesai})</p>
                <p>Keperluan: {selectedItem.tujuan_peminjaman}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pembaruan Status Pengajuan *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusPengajuan)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi (Pending)</option>
                  <option value="Disetujui">Disetujui (Surat Izin Diterbitkan)</option>
                  <option value="Selesai">Selesai (Kegiatan Telah Terlaksana)</option>
                  <option value="Ditolak">Ditolak (Jadwal Bentrok / Tidak Memenuhi Syarat)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tindak Lanjut Pengurus Masjid *
                </label>
                <textarea
                  rows={3}
                  value={petugasCatatan}
                  onChange={(e) => setPetugasCatatan(e.target.value)}
                  placeholder="Instruksi pengambilan perlengkapan, jadwal koordinasi, atau keterangan..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Catatan ini akan langsung terlihat oleh pemohon di halaman Cek Status Pengajuan.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Status & Catat Riwayat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
