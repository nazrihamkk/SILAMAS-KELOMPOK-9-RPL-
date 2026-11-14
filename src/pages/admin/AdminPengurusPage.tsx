import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { PengurusItem, MasjidItem } from '../../types/index.js';
import { ConfirmationModal } from '../../components/ConfirmationModal.js';
import { Plus, Search, Edit2, Trash2, Users, Phone, X, AlertCircle } from 'lucide-react';

export const AdminPengurusPage: React.FC = () => {
  const { user } = useAuth();
  const [pengurus, setPengurus] = useState<PengurusItem[]>([]);
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMasjid, setFilterMasjid] = useState(user?.id_masjid || 'all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengurusItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PengurusItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    id_masjid: user?.id_masjid || '',
    nama_pengurus: '',
    jabatan: 'Ketua Umum DKM',
    kontak: '',
    periode: '2024 - 2027',
    email: '',
  });

  const loadData = async () => {
    try {
      const [peng, msj] = await Promise.all([
        api.getPengurus({ id_masjid: user?.id_masjid || undefined }),
        api.getMasjids(),
      ]);
      setPengurus(peng);
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
      nama_pengurus: '',
      jabatan: 'Ketua Umum DKM',
      kontak: '',
      periode: '2024 - 2027',
      email: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (item: PengurusItem) => {
    setEditingItem(item);
    setFormData({
      id_masjid: item.id_masjid,
      nama_pengurus: item.nama_pengurus,
      jabatan: item.jabatan,
      kontak: item.kontak,
      periode: item.periode,
      email: item.email || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_pengurus || !formData.jabatan || !formData.id_masjid) {
      setErrorMsg('Nama pengurus, jabatan, dan masjid wajib diisi.');
      return;
    }

    try {
      if (editingItem) {
        await api.updatePengurus(editingItem.id_pengurus, formData);
      } else {
        await api.createPengurus(formData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengurus.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deletePengurus(deleteTarget.id_pengurus);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengurus.');
    }
  };

  const filtered = pengurus.filter((p) => {
    if (filterMasjid !== 'all' && p.id_masjid !== filterMasjid) return false;
    if (
      search &&
      !p.nama_pengurus.toLowerCase().includes(search.toLowerCase()) &&
      !p.jabatan.toLowerCase().includes(search.toLowerCase())
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
            Susunan Pengurus DKM Masjid
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Data dewan kemakmuran masjid, struktur organisasi, kontak komunikasi, dan masa khidmah.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengurus Baru</span>
        </button>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama pengurus atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {user?.role === 'admin' && (
          <select
            value={filterMasjid}
            onChange={(e) => setFilterMasjid(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Masjid</option>
            {masjids.map((m) => (
              <option key={m.id_masjid} value={m.id_masjid}>
                {m.nama_masjid}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabel Data Pengurus */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                <th className="py-3 px-4">Jabatan DKM</th>
                <th className="py-3 px-4">Masjid</th>
                <th className="py-3 px-4">Nomor WhatsApp</th>
                <th className="py-3 px-4 text-center">Periode Khidmah</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id_pengurus} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.nama_pengurus}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {p.jabatan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.nama_masjid}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{p.kontak || '-'}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">{p.periode}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Pengurus"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Pengurus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Tidak ada susunan pengurus yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jendela Tambah / Edit Pengurus */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}
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
                    Masjid *
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
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  value={formData.nama_pengurus}
                  onChange={(e) => setFormData({ ...formData, nama_pengurus: e.target.value })}
                  placeholder="Contoh: Drs. H. Rusdi Mastura, M.Si"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan dalam DKM *
                  </label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ketua Umum DKM">Ketua Umum DKM</option>
                    <option value="Wakil Ketua">Wakil Ketua</option>
                    <option value="Sekretaris Umum">Sekretaris Umum</option>
                    <option value="Bendahara Umum">Bendahara Umum</option>
                    <option value="Seksi Ibadah & Dakwah">Seksi Ibadah & Dakwah</option>
                    <option value="Seksi Pemeliharaan Sarana">Seksi Pemeliharaan Sarana</option>
                    <option value="Seksi Sosial & Kesejahteraan">Seksi Sosial & Kesejahteraan</option>
                    <option value="Seksi Remaja Masjid (RISMA)">Seksi Remaja Masjid (RISMA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Khidmah
                  </label>
                  <input
                    type="text"
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                    placeholder="Contoh: 2024 - 2027"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kontak WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.kontak}
                    onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pengurus@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  Simpan Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jendela Konfirmasi Hapus */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Hapus Pengurus"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.nama_pengurus}" (${deleteTarget?.jabatan}) dari data kepengurusan?`}
        confirmLabel="Hapus Pengurus"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
