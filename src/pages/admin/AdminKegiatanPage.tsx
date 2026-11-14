import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { KegiatanItem, MasjidItem } from '../../types/index.js';
import { ConfirmationModal } from '../../components/ConfirmationModal.js';
import { Plus, Search, Edit2, Trash2, Calendar, Clock, X, AlertCircle } from 'lucide-react';

export const AdminKegiatanPage: React.FC = () => {
  const { user } = useAuth();
  const [kegiatan, setKegiatan] = useState<KegiatanItem[]>([]);
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KegiatanItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KegiatanItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    id_masjid: user?.id_masjid || '',
    nama_kegiatan: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '05:30 - 07:00 WITA',
    penceramah: '',
    lokasi: 'Ruang Shalat Utama',
    keterangan: '',
    status: 'Akan Datang' as 'Akan Datang' | 'Berlangsung' | 'Selesai' | 'Dibatalkan',
  });

  const loadData = async () => {
    try {
      const [kgt, msj] = await Promise.all([
        api.getKegiatan({ id_masjid: user?.id_masjid || undefined }),
        api.getMasjids(),
      ]);
      setKegiatan(kgt);
      setMasjids(msj);
      if (!formData.id_masjid && msj.length > 0) {
        setFormData((prev) => ({ ...prev, id_masjid: msj[0].id_masjid }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      id_masjid: user?.id_masjid || (masjids[0]?.id_masjid || ''),
      nama_kegiatan: '',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: '05:30 - 07:00 WITA',
      penceramah: '',
      lokasi: 'Ruang Shalat Utama',
      keterangan: '',
      status: 'Akan Datang',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (item: KegiatanItem) => {
    setEditingItem(item);
    setFormData({
      id_masjid: item.id_masjid,
      nama_kegiatan: item.nama_kegiatan,
      tanggal: item.tanggal,
      waktu: item.waktu,
      penceramah: item.penceramah || '',
      lokasi: item.lokasi,
      keterangan: item.keterangan,
      status: item.status,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_kegiatan || !formData.tanggal || !formData.id_masjid) {
      setErrorMsg('Nama kegiatan, tanggal, dan masjid wajib diisi.');
      return;
    }

    try {
      if (editingItem) {
        await api.updateKegiatan(editingItem.id_kegiatan, formData);
      } else {
        await api.createKegiatan(formData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan agenda kegiatan.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteKegiatan(deleteTarget.id_kegiatan);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kegiatan.');
    }
  };

  const filtered = kegiatan.filter((k) => {
    if (filterStatus !== 'all' && k.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (
      search &&
      !k.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) &&
      !k.penceramah?.toLowerCase().includes(search.toLowerCase()) &&
      !k.lokasi.toLowerCase().includes(search.toLowerCase())
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
            Agenda Kegiatan & Dakwah Masjid
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal kajian rutin, pembinaan anak/remaja, peringatan hari besar Islam, dan aktivitas sosial.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kegiatan Baru</span>
        </button>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kegiatan, penceramah, atau lokasi..."
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
          <option value="all">Semua Status Pelaksanaan</option>
          <option value="Akan Datang">Akan Datang</option>
          <option value="Berlangsung">Berlangsung</option>
          <option value="Selesai">Selesai</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {/* Tabel Agenda Kegiatan */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Kegiatan</th>
                <th className="py-3 px-4">Masjid</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Penceramah / Pembicara</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((k) => (
                <tr key={k.id_kegiatan} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{k.nama_kegiatan}</td>
                  <td className="py-3.5 px-4 text-slate-600">{k.nama_masjid}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-900 font-semibold">{k.tanggal}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">{k.waktu}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{k.penceramah || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{k.lokasi}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        k.status === 'Akan Datang'
                          ? 'bg-emerald-50 text-emerald-800'
                          : k.status === 'Berlangsung'
                          ? 'bg-sky-50 text-sky-800'
                          : k.status === 'Selesai'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(k)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Kegiatan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(k)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Kegiatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada agenda kegiatan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jendela Tambah / Edit Kegiatan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {user?.role === 'admin' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Masjid Pelaksana *
                  </label>
                  <select
                    value={formData.id_masjid}
                    onChange={(e) => setFormData({ ...formData, id_masjid: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {masjids.map((m) => (
                      <option key={m.id_masjid} value={m.id_masjid}>
                        {m.nama_masjid}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kegiatan / Kajian *
                </label>
                <input
                  type="text"
                  value={formData.nama_kegiatan}
                  onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                  placeholder="Contoh: Kajian Tafsir Ahad Shubuh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu / Pukul
                  </label>
                  <input
                    type="text"
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                    placeholder="Contoh: 05:30 WITA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penceramah / Pembicara
                  </label>
                  <input
                    type="text"
                    value={formData.penceramah}
                    onChange={(e) => setFormData({ ...formData, penceramah: e.target.value })}
                    placeholder="Nama ustadz / narasumber"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Pelaksanaan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi / Ruangan
                </label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Contoh: Ruang Shalat Utama / Aula Lt. 2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Tema kajian, sasaran jemaah, atau fasilitas gratis..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Simpan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jendela Konfirmasi Hapus */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Hapus Agenda Kegiatan"
        message={`Apakah Anda yakin ingin menghapus kegiatan "${deleteTarget?.nama_kegiatan}"?`}
        confirmLabel="Hapus Kegiatan"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
