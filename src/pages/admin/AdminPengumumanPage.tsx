import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { PengumumanItem, MasjidItem } from '../../types/index.js';
import { ConfirmationModal } from '../../components/ConfirmationModal.js';
import { Plus, Search, Edit2, Trash2, Bell, X, AlertCircle } from 'lucide-react';

export const AdminPengumumanPage: React.FC = () => {
  const { user } = useAuth();
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengumumanItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PengumumanItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    id_masjid: user?.id_masjid || '',
    judul: '',
    isi: '',
    tanggal: new Date().toISOString().split('T')[0],
    penulis: user?.nama || 'Sekretariat DKM',
    kategori: 'Umum' as 'Umum' | 'Keuangan' | 'Kegiatan' | 'Duka Cita',
  });

  const loadData = async () => {
    try {
      const [pgm, msj] = await Promise.all([
        api.getPengumuman({ id_masjid: user?.id_masjid || undefined }),
        api.getMasjids(),
      ]);
      setPengumuman(pgm);
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
      judul: '',
      isi: '',
      tanggal: new Date().toISOString().split('T')[0],
      penulis: user?.nama || 'Sekretariat DKM',
      kategori: 'Umum',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (item: PengumumanItem) => {
    setEditingItem(item);
    setFormData({
      id_masjid: item.id_masjid,
      judul: item.judul,
      isi: item.isi,
      tanggal: item.tanggal,
      penulis: item.penulis,
      kategori: item.kategori,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.judul || !formData.isi || !formData.id_masjid) {
      setErrorMsg('Judul, isi pengumuman, dan masjid wajib diisi.');
      return;
    }

    try {
      if (editingItem) {
        await api.updatePengumuman(editingItem.id_pengumuman, formData);
      } else {
        await api.createPengumuman(formData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengumuman.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deletePengumuman(deleteTarget.id_pengumuman);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengumuman.');
    }
  };

  const filtered = pengumuman.filter((p) => {
    if (filterKategori !== 'all' && p.kategori.toLowerCase() !== filterKategori.toLowerCase()) return false;
    if (
      search &&
      !p.judul.toLowerCase().includes(search.toLowerCase()) &&
      !p.isi.toLowerCase().includes(search.toLowerCase())
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
            Warta & Pengumuman DKM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasi informasi resmi, laporan infaq mingguan, dan warta sosial kepada jemaah.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari judul atau isi warta pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Semua Kategori</option>
          <option value="Umum">Umum</option>
          <option value="Keuangan">Keuangan</option>
          <option value="Kegiatan">Kegiatan</option>
          <option value="Duka Cita">Duka Cita</option>
        </select>
      </div>

      {/* Daftar Kartu Pengumuman */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id_pengumuman} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                  {p.kategori}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{p.tanggal}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.judul}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{p.isi}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">Oleh: <strong className="text-slate-700">{p.penulis}</strong></span>
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit Pengumuman"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada pengumuman yang sesuai.
          </div>
        )}
      </div>

      {/* Jendela Tambah / Edit Pengumuman */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
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
                    Masjid Penerbit *
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
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Laporan Kas Infaq Jum'at Pekan Ini"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Warta
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Duka Cita">Duka Cita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isi Pengumuman Lengkap *
                </label>
                <textarea
                  rows={4}
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  placeholder="Tuliskan isi pengumuman secara rinci..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
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
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jendela Konfirmasi Hapus */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${deleteTarget?.judul}"?`}
        confirmLabel="Hapus Pengumuman"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
