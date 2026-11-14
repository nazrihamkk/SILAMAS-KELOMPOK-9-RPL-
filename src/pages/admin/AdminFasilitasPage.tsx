import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { FasilitasItem, MasjidItem } from '../../types/index.js';
import { ConfirmationModal } from '../../components/ConfirmationModal.js';
import { Plus, Search, Edit2, Trash2, Package, X, AlertCircle } from 'lucide-react';

export const AdminFasilitasPage: React.FC = () => {
  const { user } = useAuth();
  const [fasilitas, setFasilitas] = useState<FasilitasItem[]>([]);
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMasjid, setFilterMasjid] = useState(user?.id_masjid || 'all');
  const [filterKondisi, setFilterKondisi] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FasilitasItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FasilitasItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    id_masjid: user?.id_masjid || '',
    nama_fasilitas: '',
    jumlah: 1,
    kondisi: 'Baik' as 'Baik' | 'Rusak Ringan' | 'Rusak Berat',
    keterangan: '',
    bisa_dipinjam: true,
  });

  const loadData = async () => {
    try {
      const [fas, msj] = await Promise.all([
        api.getFasilitas({ id_masjid: user?.id_masjid || undefined }),
        api.getMasjids(),
      ]);
      setFasilitas(fas);
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
      nama_fasilitas: '',
      jumlah: 1,
      kondisi: 'Baik',
      keterangan: '',
      bisa_dipinjam: true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (item: FasilitasItem) => {
    setEditingItem(item);
    setFormData({
      id_masjid: item.id_masjid,
      nama_fasilitas: item.nama_fasilitas,
      jumlah: item.jumlah,
      kondisi: item.kondisi,
      keterangan: item.keterangan,
      bisa_dipinjam: item.bisa_dipinjam,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_fasilitas || !formData.id_masjid) {
      setErrorMsg('Nama fasilitas dan masjid wajib dipilih.');
      return;
    }

    try {
      if (editingItem) {
        await api.updateFasilitas(editingItem.id_fasilitas, formData);
      } else {
        await api.createFasilitas(formData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan fasilitas.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteFasilitas(deleteTarget.id_fasilitas);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus fasilitas.');
    }
  };

  const filtered = fasilitas.filter((f) => {
    if (filterMasjid !== 'all' && f.id_masjid !== filterMasjid) return false;
    if (filterKondisi !== 'all' && f.kondisi.toLowerCase() !== filterKondisi.toLowerCase()) return false;
    if (
      search &&
      !f.nama_fasilitas.toLowerCase().includes(search.toLowerCase()) &&
      !f.keterangan.toLowerCase().includes(search.toLowerCase())
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
            Perlengkapan & Fasilitas Masjid
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendataan kondisi perlengkapan, jumlah sarana ibadah, dan ketersediaan pinjam bagi jemaah.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Fasilitas Baru</span>
        </button>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari sarana atau fasilitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {user?.role === 'admin' && (
          <select
            value={filterMasjid}
            onChange={(e) => setFilterMasjid(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Masjid Terdaftar</option>
            {masjids.map((m) => (
              <option key={m.id_masjid} value={m.id_masjid}>
                {m.nama_masjid}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterKondisi}
          onChange={(e) => setFilterKondisi(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Semua Kondisi Fisik</option>
          <option value="Baik">Kondisi Baik</option>
          <option value="Rusak Ringan">Rusak Ringan</option>
          <option value="Rusak Berat">Rusak Berat</option>
        </select>
      </div>

      {/* Tabel Data Fasilitas */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Sarana / Fasilitas</th>
                <th className="py-3 px-4">Masjid</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4 text-center">Kondisi</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Dapat Dipinjam</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id_fasilitas} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{f.nama_fasilitas}</td>
                  <td className="py-3.5 px-4 text-slate-600">{f.nama_masjid}</td>
                  <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800">
                    {f.jumlah}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        f.kondisi === 'Baik'
                          ? 'bg-emerald-50 text-emerald-700'
                          : f.kondisi === 'Rusak Ringan'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {f.kondisi}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{f.keterangan || '-'}</td>
                  <td className="py-3.5 px-4 text-center">
                    {f.bisa_dipinjam ? (
                      <span className="text-emerald-700 font-semibold">Tersedia</span>
                    ) : (
                      <span className="text-slate-400">Khusus Internal</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(f)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Fasilitas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(f)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Fasilitas"
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
                    Tidak ada inventaris fasilitas yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jendela Tambah / Edit Fasilitas */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}
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
                    Masjid Terkait *
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
                  Nama Sarana / Fasilitas *
                </label>
                <input
                  type="text"
                  value={formData.nama_fasilitas}
                  onChange={(e) => setFormData({ ...formData, nama_fasilitas: e.target.value })}
                  placeholder="Contoh: Gedung Aula Serbaguna, Mobil Ambulans Jenazah"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah / Kuantitas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi Fisik *
                  </label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Spesifikasi / Kapasitas
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Merk, kapasitas daya, kelengkapan, dll."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bisa_dipinjam"
                  checked={formData.bisa_dipinjam}
                  onChange={(e) => setFormData({ ...formData, bisa_dipinjam: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="bisa_dipinjam" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Fasilitas dapat dipinjam oleh masyarakat / jemaah umum
                </label>
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
                  Simpan Fasilitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jendela Konfirmasi Hapus */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Hapus Fasilitas"
        message={`Apakah Anda yakin ingin menghapus data inventaris "${deleteTarget?.nama_fasilitas}"?`}
        confirmLabel="Hapus Fasilitas"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
