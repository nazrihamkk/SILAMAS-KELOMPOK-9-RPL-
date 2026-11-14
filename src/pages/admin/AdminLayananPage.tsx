import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { LayananItem, StatusPengajuan } from '../../types/index.js';
import { Search, HeartHandshake, CheckCircle2, Clock, XCircle, Edit3, X, AlertCircle } from 'lucide-react';

export const AdminLayananPage: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<LayananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedItem, setSelectedItem] = useState<LayananItem | null>(null);
  const [newStatus, setNewStatus] = useState<StatusPengajuan>('Diproses');
  const [petugasCatatan, setPetugasCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const data = await api.getLayanan({ id_masjid: user?.id_masjid || undefined });
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

  const openActionModal = (item: LayananItem) => {
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
      await api.updateStatusLayanan(selectedItem.id_layanan, newStatus, petugasCatatan);
      setSelectedItem(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui status layanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = list.filter((l) => {
    if (filterStatus !== 'all' && l.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (
      search &&
      !l.nama_pemohon.toLowerCase().includes(search.toLowerCase()) &&
      !l.kode_pelacakan.toLowerCase().includes(search.toLowerCase()) &&
      !l.jenis_layanan.toLowerCase().includes(search.toLowerCase())
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
            Pemeriksaan & Tindak Lanjut Layanan Jemaah
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penanganan layanan ambulans jenazah, konsultasi ibadah, bimbingan keagamaan, dan bantuan sosial jemaah.
          </p>
        </div>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode pengajuan, nama pemohon, atau jenis layanan..."
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
          <option value="all">Semua Status Layanan</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          <option value="Diproses">Diproses</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Selesai">Selesai</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>

      {/* Tabel Permohonan Layanan Jemaah */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode Pengajuan</th>
                <th className="py-3 px-4">Nama Pemohon</th>
                <th className="py-3 px-4">Jenis Layanan</th>
                <th className="py-3 px-4">Masjid Tujuan</th>
                <th className="py-3 px-4">Rincian Kebutuhan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id_layanan} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{l.kode_pelacakan}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{l.nama_pemohon}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{l.kontak_pemohon}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{l.jenis_layanan}</td>
                  <td className="py-3.5 px-4 text-slate-600">{l.nama_masjid}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{l.rincian_kebutuhan}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        l.status === 'Selesai'
                          ? 'bg-teal-50 text-teal-800'
                          : l.status === 'Disetujui'
                          ? 'bg-emerald-50 text-emerald-800'
                          : l.status === 'Diproses'
                          ? 'bg-sky-50 text-sky-800'
                          : l.status === 'Ditolak'
                          ? 'bg-rose-50 text-rose-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openActionModal(l)}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tanggapi</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada permohonan layanan yang sesuai kriteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jendela Tindak Lanjut Layanan */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-teal-700 font-bold block">
                  {selectedItem.kode_pelacakan}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Pemeriksaan & Tindak Lanjut Layanan Jemaah
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

              <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100">
                <p>Pemohon: <strong className="text-slate-900">{selectedItem.nama_pemohon}</strong> ({selectedItem.kontak_pemohon})</p>
                <p>Layanan: <strong className="text-slate-900">{selectedItem.jenis_layanan}</strong></p>
                <p>Masjid: {selectedItem.nama_masjid}</p>
                <p>Rincian: {selectedItem.rincian_kebutuhan}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pemrosesan Layanan *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusPengajuan)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Diproses">Diproses (Petugas / Penghulu / Armada Ditugaskan)</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Selesai">Selesai (Pelayanan Tuntas Dilakukan)</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tindak Lanjut Petugas *
                </label>
                <textarea
                  rows={3}
                  value={petugasCatatan}
                  onChange={(e) => setPetugasCatatan(e.target.value)}
                  placeholder="Misal: Driver ambulans atas nama Bpk. Herman telah meluncur ke lokasi..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  required
                />
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
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Status Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
