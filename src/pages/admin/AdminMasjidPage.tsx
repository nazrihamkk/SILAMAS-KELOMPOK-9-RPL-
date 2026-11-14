/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { MasjidItem } from '../../types/index.js';
import { MosqueMap, MapLocationPicker } from '../../components/MosqueMap.js';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  Search,
  Upload,
  Link2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Eye,
  RotateCcw,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';

const DEFAULT_FORM = {
  nama_masjid: '',
  alamat: '',
  kelurahan: '',
  kecamatan: 'Wilayah Terdaftar',
  latitude: -0.8965,
  longitude: 119.8755,
  kapasitas: 300,
  kapasitas_teks: 'Sekitar 300 jemaah',
  luas_tanah: 'Belum tercatat',
  status_tanah: 'Belum tercatat',
  tahun_berdiri: 2000,
  deskripsi: '',
  fasilitas_ringkas: 'Tempat wudu; Toilet; Pengeras suara; Karpet; Area parkir',
  nama_pengurus_utama: 'Belum tercatat',
  telepon: '-',
  email: '-',
  foto_url: '',
  kata_kunci_foto_google: '',
  status_foto: 'Belum ada foto terverifikasi',
  sumber_data: 'Input Terverifikasi Administrator SILAMAS',
  catatan_verifikasi: 'Titik lokasi dan atribut masjid diverifikasi melalui peta interaktif SILAMAS.',
  skor_rekomendasi: 9.0,
  status_verifikasi: 'Terverifikasi' as 'Terverifikasi' | 'Perlu Verifikasi' | 'Belum diverifikasi',
};

export const AdminMasjidPage: React.FC = () => {
  const { user } = useAuth();
  const [masjidList, setMasjidList] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelurahan, setSelectedKelurahan] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
  const [validationError, setValidationError] = useState('');
  const [showPreviewStep, setShowPreviewStep] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationPicked, setLocationPicked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState('');

  const WILAYAH_LOCATIONS = [
    { label: 'Lolu Utara', kelurahan: 'Lolu Utara', lat: -0.8986, lng: 119.8742, alamat: 'Kawasan Lolu Utara' },
    { label: 'Lolu Selatan', kelurahan: 'Lolu Selatan', lat: -0.9052, lng: 119.8758, alamat: 'Kawasan Lolu Selatan' },
    { label: 'Besusu Barat', kelurahan: 'Besusu Barat', lat: -0.8895, lng: 119.8708, alamat: 'Kawasan Besusu Barat' },
    { label: 'Besusu Tengah', kelurahan: 'Besusu Tengah', lat: -0.8924, lng: 119.8751, alamat: 'Kawasan Besusu Tengah' },
    { label: 'Besusu Timur', kelurahan: 'Besusu Timur', lat: -0.8938, lng: 119.8825, alamat: 'Kawasan Besusu Timur' },
    { label: 'Tanamodindi', kelurahan: 'Tanamodindi', lat: -0.9025, lng: 119.8865, alamat: 'Kawasan Tanamodindi' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMasjids = async () => {
    try {
      const data = await api.getMasjids();
      setMasjidList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasjids();
  }, []);

  const scopedMasjid =
    user?.role === 'admin' || !user?.id_masjid
      ? masjidList
      : masjidList.filter((m) => m.id_masjid === user.id_masjid);

  const kelurahanOptions = [
    'Semua',
    ...Array.from(new Set(scopedMasjid.map((m) => m.kelurahan).filter(Boolean))).sort(),
  ];

  const filteredMasjid = scopedMasjid.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      m.nama_masjid.toLowerCase().includes(q) ||
      m.alamat.toLowerCase().includes(q) ||
      m.kelurahan.toLowerCase().includes(q) ||
      (m.nama_pengurus_utama || '').toLowerCase().includes(q);
    const matchKel = selectedKelurahan === 'Semua' || m.kelurahan === selectedKelurahan;
    return matchSearch && matchKel;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setValidationError('');
    setShowPreviewStep(false);
    setLocationConfirmed(false);
    setLocationPicked(false);
    setShowModal(true);
  };

  const openEdit = (m: MasjidItem) => {
    setEditingId(m.id_masjid);
    setForm({
      nama_masjid: m.nama_masjid,
      alamat: m.alamat,
      kelurahan: m.kelurahan,
      kecamatan: m.kecamatan || 'Wilayah Terdaftar',
      latitude: Number(m.latitude),
      longitude: Number(m.longitude),
      kapasitas: m.kapasitas || 250,
      kapasitas_teks: m.kapasitas_teks || `Sekitar ${m.kapasitas} jemaah`,
      luas_tanah: m.luas_tanah || 'Belum tercatat',
      status_tanah: m.status_tanah || 'Belum tercatat',
      tahun_berdiri: m.tahun_berdiri || 2000,
      deskripsi: m.deskripsi || '',
      fasilitas_ringkas: m.fasilitas_ringkas || '',
      nama_pengurus_utama: m.nama_pengurus_utama || 'Belum tercatat',
      telepon: m.telepon || '-',
      email: m.email || '-',
      foto_url: m.foto_url || '',
      kata_kunci_foto_google: m.kata_kunci_foto_google || `${m.nama_masjid} ${m.kelurahan}`,
      status_foto: m.status_foto || (m.foto_url ? 'Foto masjid terverifikasi' : 'Belum ada foto terverifikasi'),
      sumber_data: m.sumber_data || 'Database SILAMAS',
      catatan_verifikasi: m.catatan_verifikasi || '',
      skor_rekomendasi: m.skor_rekomendasi || 9.0,
      status_verifikasi: m.status_verifikasi || 'Terverifikasi',
    });
    setValidationError('');
    setShowPreviewStep(false);
    setLocationConfirmed(false);
    setLocationPicked(true);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationError('File yang diunggah harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setValidationError('Ukuran file foto maksimal 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setForm((prev) => ({
        ...prev,
        foto_url: dataUrl,
        status_foto: `Foto diunggah (${file.name})`,
      }));
      setValidationError('');
    };
    reader.readAsDataURL(file);
  };

  const validateBeforePreview = (): boolean => {
    setValidationError('');

    if (!editingId && !locationPicked) {
      setValidationError(
        'Wajib memilih titik lokasi masjid terlebih dahulu pada peta (melalui klik peta, cari lokasi, tombol wilayah cepat, geser penanda, atau lokasi perangkat).'
      );
      return false;
    }

    if (
      !form.nama_masjid.trim() ||
      !form.alamat.trim() ||
      !form.kelurahan.trim() ||
      !form.deskripsi.trim()
    ) {
      setValidationError(
        'Seluruh data utama (Nama Masjid, Kelurahan, Alamat, dan Deskripsi) wajib diisi lengkap.'
      );
      return false;
    }

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setValidationError('Koordinat latitude dan longitude harus berupa angka desimal yang valid.');
      return false;
    }

    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
      setValidationError(
        `Koordinat terdeteksi TERTUKAR! Nilai Latitude (${lat}) berada di luar rentang [-90, 90]. Pastikan Latitude adalah lintang (contoh: -0.89) dan Longitude adalah bujur (contoh: 119.87).`
      );
      return false;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setValidationError(
        'Rentang koordinat tidak valid. Latitude harus [-90 s/d 90] dan Longitude [-180 s/d 180].'
      );
      return false;
    }

    const normName = form.nama_masjid.trim().toLowerCase();
    const normAddr = form.alamat.trim().toLowerCase();
    const normPhoto = form.foto_url.trim();

    for (const m of masjidList) {
      if (editingId && m.id_masjid === editingId) continue;

      if (
        m.nama_masjid.trim().toLowerCase() === normName &&
        m.alamat.trim().toLowerCase() === normAddr
      ) {
        setValidationError(
          `Data masjid "${form.nama_masjid}" pada alamat tersebut sudah terdaftar. Data yang sama tidak boleh disimpan dua kali.`
        );
        return false;
      }

      const dLat = Math.abs(m.latitude - lat);
      const dLng = Math.abs(m.longitude - lng);
      if (dLat < 0.00005 && dLng < 0.00005) {
        setValidationError(
          `Titik koordinat (${lat.toFixed(6)}, ${lng.toFixed(6)}) sama persis dengan lokasi "${m.nama_masjid}". Geser penanda peta ke titik lokasi masjid yang sebenarnya.`
        );
        return false;
      }

      if (normPhoto && m.foto_url && m.foto_url.trim() === normPhoto) {
        setValidationError(
          `Foto yang digunakan terdeteksi sama dengan foto milik "${m.nama_masjid}". Dilarang menggunakan foto dari masjid lain.`
        );
        return false;
      }
    }

    return true;
  };

  const handleProceedToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBeforePreview()) {
      setShowPreviewStep(true);
    }
  };

  const handleConfirmSave = async () => {
    if (!locationConfirmed) {
      setValidationError(
        'Harap centang konfirmasi bahwa titik penanda lokasi dan data masjid sudah diperiksa dan benar.'
      );
      return;
    }

    setSubmitting(true);
    setValidationError('');
    try {
      if (editingId) {
        await api.updateMasjid(editingId, form);
        setBannerMessage('Data profil dan titik lokasi masjid berhasil diperbarui.');
      } else {
        await api.createMasjid(form);
        setBannerMessage('Masjid baru berhasil diverifikasi dan disimpan ke dalam sistem SILAMAS.');
      }
      setShowModal(false);
      setShowPreviewStep(false);
      await loadMasjids();
      setTimeout(() => setBannerMessage(''), 4000);
    } catch (err: any) {
      setValidationError(err.message || 'Gagal menyimpan data masjid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMasjid(id);
      setDeleteConfirmId(null);
      setBannerMessage('Data masjid berhasil dihapus dari sistem.');
      await loadMasjids();
      setTimeout(() => setBannerMessage(''), 4000);
    } catch (err: any) {
      setValidationError(err.message || 'Gagal menghapus data masjid.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Memuat data masjid dan peta lokasi...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {bannerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* Bilah Pencarian dan Filter Atas */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900">
            Kelola Daftar & Pemetaan Lokasi Masjid ({filteredMasjid.length} Masjid)
          </h2>
          <p className="text-xs text-slate-500">
            Kelola profil masjid, fasilitas, pengurus utama, foto, serta validasi titik koordinat peta secara akurat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, alamat, pengurus..."
              className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <select
            value={selectedKelurahan}
            onChange={(e) => setSelectedKelurahan(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {kelurahanOptions.map((kel) => (
              <option key={kel} value={kel}>
                {kel === 'Semua' ? 'Semua Kelurahan / Wilayah' : `Kel. ${kel}`}
              </option>
            ))}
          </select>

          {user?.role === 'admin' && (
            <button
              onClick={openAdd}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Masjid
            </button>
          )}
        </div>
      </div>

      {/* Peta Sebaran Lokasi Masjid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Peta Lokasi Masjid
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Pilih penanda pada peta untuk melihat nama, alamat, dan profil masjid.
          </span>
        </div>
        <MosqueMap masjids={filteredMasjid} height="340px" showExternalButtons={false} />
      </div>

      {/* Daftar Kartu Masjid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMasjid.map((m) => {
          const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}`;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`;

          return (
            <div
              key={m.id_masjid}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 relative overflow-hidden flex flex-col justify-between p-4">
                  {m.foto_url ? (
                    <>
                      <img
                        src={m.foto_url}
                        alt={m.nama_masjid}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/45 to-slate-950/20" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-md">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600/90 flex items-center justify-center text-white shadow-xs">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 2L9 8h6l-3-6zm0 7c-4.4 0-8 3.6-8 8v4h16v-4c0-4.4-3.6-8-8-8zm-5 10c.5-2.8 3-5 5-5s4.5 2.2 5 5H7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/75 text-emerald-200 border border-white/15 text-[10px] font-mono font-semibold">
                      {m.id_masjid}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/85 text-white border border-emerald-400/30 text-[10px] font-semibold">
                      {(m.kelurahan || '').replace(/^kelurahan\s+/i, '').trim() || 'Wilayah Terdaftar'}
                    </span>
                  </div>
                  <div className="relative z-10 text-white pt-1">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{m.nama_masjid}</h3>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{m.alamat}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2">{m.deskripsi}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Kapasitas Jemaah</span>
                      <span className="font-bold text-slate-800">
                        {m.kapasitas_teks || `${m.kapasitas} Jemaah`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pengurus Utama</span>
                      <span className="font-bold text-slate-800">
                        {m.nama_pengurus_utama || 'Belum tercatat'}
                      </span>
                    </div>
                  </div>

                  {m.fasilitas_ringkas && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <strong className="text-slate-800">Fasilitas:</strong> {m.fasilitas_ringkas}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-600 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-emerald-700" /> Buka di Google Maps
                  </a>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-600 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-emerald-700" /> Petunjuk Arah
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit / Ganti Lokasi
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setDeleteConfirmId(m.id_masjid)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jendela Konfirmasi Hapus Masjid */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">
              Konfirmasi Hapus Data Masjid
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data masjid ini beserta seluruh fasilitas dan jadwal terkait? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Ya, Hapus Masjid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jendela Tambah / Edit Masjid beserta Pemilih Titik Peta & Pratinjau Wajib */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                  {showPreviewStep
                    ? 'Tahap 2 dari 2: Pratinjau Lokasi & Validasi Akhir'
                    : 'Tahap 1 dari 2: Pengisian Data & Pemetaan Lokasi'}
                </span>
                <h3 className="font-extrabold text-xl text-slate-900">
                  {editingId ? 'Edit Data & Lokasi Masjid' : 'Tambah Masjid Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900 mb-0.5">
                    Validasi Data Menemukan Kesalahan:
                  </p>
                  <p>{validationError}</p>
                </div>
              </div>
            )}

            {!showPreviewStep ? (
              <form onSubmit={handleProceedToPreview} className="space-y-6">
                {/* Bagian Pemilihan Titik Lokasi Peta (WAJIB) */}
                <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700" /> 1. Pilih Titik Lokasi Masjid di Peta (Wajib) *
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            locationPicked
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {locationPicked
                            ? `Lokasi Terpilih: ${form.kelurahan || 'Titik Peta Aktif'} ✓`
                            : 'Wajib Pilih Titik Lokasi'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800/90 mt-1">
                        Pilih salah satu wilayah cepat di bawah, cari nama jalan/masjid, atau klik langsung pada peta untuk menetapkan lokasi masjid secara akurat.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          latitude: -0.8965,
                          longitude: 119.8755,
                        }));
                        setLocationPicked(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Titik Peta
                    </button>
                  </div>

                  {/* Pilihan Cepat Titik Wilayah */}
                  <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-950 block">
                      Pilihan Cepat Wilayah (Klik untuk mengarahkan penanda peta ke wilayah masjid):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {WILAYAH_LOCATIONS.map((wil) => {
                        const isSelectedWilayah =
                          locationPicked &&
                          form.kelurahan.toLowerCase() === wil.kelurahan.toLowerCase();
                        return (
                          <button
                            key={wil.label}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                latitude: wil.lat,
                                longitude: wil.lng,
                                kelurahan: wil.kelurahan,
                                alamat: prev.alamat ? prev.alamat : wil.alamat,
                              }));
                              setLocationPicked(true);
                              setValidationError('');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelectedWilayah
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                                : 'bg-slate-50 hover:bg-emerald-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{wil.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <MapLocationPicker
                    latitude={Number(form.latitude)}
                    longitude={Number(form.longitude)}
                    onChangeLocation={(lat, lng, detectedAddress, detectedKelurahan) => {
                      setForm((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        alamat: detectedAddress ? detectedAddress : prev.alamat,
                        kelurahan:
                          detectedKelurahan ? detectedKelurahan : prev.kelurahan,
                      }));
                      setLocationPicked(true);
                      setValidationError('');
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Latitude (Garis Lintang: -90 s/d 90) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={form.latitude}
                        onChange={(e) => {
                          setForm({ ...form, latitude: parseFloat(e.target.value) || 0 });
                          setLocationPicked(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Longitude (Garis Bujur: -180 s/d 180) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={form.longitude}
                        onChange={(e) => {
                          setForm({ ...form, longitude: parseFloat(e.target.value) || 0 });
                          setLocationPicked(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Input Data Identitas Utama Masjid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Masjid *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Masjid Agung Baiturrahim"
                      value={form.nama_masjid}
                      onChange={(e) => setForm({ ...form, nama_masjid: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kelurahan / Desa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Lolu Utara / Besusu Timur"
                      value={form.kelurahan}
                      onChange={(e) => setForm({ ...form, kelurahan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kecamatan / Wilayah *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Wilayah Terdaftar"
                      value={form.kecamatan}
                      onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Lengkap (Terisi otomatis dari peta atau dapat disesuaikan) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.alamat}
                      onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      placeholder="Jl. Masjid Raya No. 30, Lolu Utara..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kapasitas Jemaah (Angka) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={form.kapasitas}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setForm({
                          ...form,
                          kapasitas: val,
                          kapasitas_teks: `Sekitar ${val.toLocaleString('id-ID')} jemaah`,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keterangan Kapasitas (Teks)
                    </label>
                    <input
                      type="text"
                      value={form.kapasitas_teks}
                      onChange={(e) => setForm({ ...form, kapasitas_teks: e.target.value })}
                      placeholder="Contoh: Sekitar 500 jemaah"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Pengurus Utama
                    </label>
                    <input
                      type="text"
                      value={form.nama_pengurus_utama}
                      onChange={(e) => setForm({ ...form, nama_pengurus_utama: e.target.value })}
                      placeholder="Isi nama pengurus atau 'Belum tercatat'"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Telepon / Kontak Pengurus
                    </label>
                    <input
                      type="text"
                      value={form.telepon}
                      onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                      placeholder="Contoh: 0812-xxxx-xxxx atau -"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daftar Fasilitas Masjid (Pisahkan dengan tanda titik koma `;`) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fasilitas_ringkas}
                      onChange={(e) => setForm({ ...form, fasilitas_ringkas: e.target.value })}
                      placeholder="Contoh: AC; kipas angin; tempat wudu; toilet; mimbar; karpet"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deskripsi & Profil Masjid *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.deskripsi}
                      onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                      placeholder="Jelaskan profil, peran ibadah, dan fasilitas masjid..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                {/* Bagian Unggah File atau Tautan URL Foto */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Foto Dokumentasi Masjid (Opsional — Wajib Asli & Tidak Duplikat)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Unggah foto langsung dari perangkat atau masukkan tautan URL foto masjid yang bersangkutan.
                      </p>
                    </div>
                    <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPhotoInputMode('upload')}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                          photoInputMode === 'upload'
                            ? 'bg-white text-emerald-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" /> Unggah File
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoInputMode('url')}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                          photoInputMode === 'url'
                            ? 'bg-white text-emerald-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" /> Tautan URL
                      </button>
                    </div>
                  </div>

                  {photoInputMode === 'upload' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 text-xs font-bold text-slate-800 flex items-center gap-2 shadow-2xs"
                      >
                        <Upload className="w-4 h-4 text-emerald-700" />
                        {form.foto_url
                          ? 'Ganti File Foto Masjid'
                          : 'Pilih File Gambar dari Perangkat'}
                      </button>
                      {form.foto_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              foto_url: '',
                              status_foto: 'Belum ada foto terverifikasi',
                            })
                          }
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={form.foto_url.startsWith('data:') ? '' : form.foto_url}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            foto_url: e.target.value,
                            status_foto: e.target.value
                              ? 'Tautan foto terverifikasi'
                              : 'Belum ada foto terverifikasi',
                          })
                        }
                        placeholder="https://contoh-domain.com/foto-masjid-asli.jpg"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  )}

                  {form.foto_url && (
                    <div className="flex items-center gap-4 pt-2">
                      <img
                        src={form.foto_url}
                        alt="Pratinjau Foto Masjid"
                        className="w-28 h-20 object-cover rounded-xl border border-slate-300"
                      />
                      <div className="text-xs text-slate-600">
                        <p className="font-bold text-slate-800">Pratinjau Foto Terpilih</p>
                        <p className="text-[11px] text-slate-500">
                          Sistem akan memvalidasi agar foto ini tidak sama dengan foto milik masjid lain.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Lanjut ke Pratinjau Lokasi & Validasi
                  </button>
                </div>
              </form>
            ) : (
              /* TAHAP 2: PRATINJAU WAJIB & KONFIRMASI SEBELUM SIMPAN */
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base">
                        Pratinjau Lokasi & Pemeriksaan Kelengkapan Sebelum Disimpan
                      </h4>
                      <p className="text-xs text-emerald-200">
                        Periksa kembali titik penanda pada peta, koordinat, alamat, dan rincian masjid di bawah ini.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewStep(false)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-amber-300"
                  >
                    ← Kembali Ubah Data / Ganti Lokasi
                  </button>
                </div>

                {/* Peta Pratinjau Titik Lokasi */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pratinjau Peta Titik Lokasi Masjid ({form.latitude.toFixed(6)},{' '}
                    {form.longitude.toFixed(6)})
                  </p>
                  <MosqueMap
                    masjids={[
                      {
                        id_masjid: editingId || 'PREVIEW',
                        nama_masjid: form.nama_masjid,
                        alamat: form.alamat,
                        kelurahan: form.kelurahan,
                        kecamatan: form.kecamatan,
                        latitude: Number(form.latitude),
                        longitude: Number(form.longitude),
                        kapasitas: form.kapasitas,
                        kapasitas_teks: form.kapasitas_teks,
                        luas_tanah: form.luas_tanah,
                        status_tanah: form.status_tanah,
                        tahun_berdiri: form.tahun_berdiri,
                        deskripsi: form.deskripsi,
                        fasilitas_ringkas: form.fasilitas_ringkas,
                        nama_pengurus_utama: form.nama_pengurus_utama,
                        telepon: form.telepon,
                        email: form.email,
                        foto_url: form.foto_url,
                        created_at: '',
                        updated_at: '',
                      },
                    ]}
                    height="280px"
                  />
                </div>

                {/* Ringkasan Data Masjid */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nama Masjid</span>
                    <span className="font-bold text-slate-900 text-sm">{form.nama_masjid}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kelurahan & Wilayah</span>
                    <span className="font-bold text-slate-900">
                      Kel. {form.kelurahan}, {form.kecamatan}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block">Alamat Lengkap</span>
                    <span className="font-semibold text-slate-800">{form.alamat}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      Koordinat Geografis (Valid & Tidak Tertukar)
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      Lat: {form.latitude} | Lng: {form.longitude}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kapasitas & Pengurus Utama</span>
                    <span className="font-semibold text-slate-800">
                      {form.kapasitas_teks} • Pengurus:{' '}
                      {form.nama_pengurus_utama || 'Belum tercatat'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block">Fasilitas Utama</span>
                    <span className="text-slate-700">{form.fasilitas_ringkas}</span>
                  </div>
                </div>

                {/* Kotak Centang Konfirmasi Wajib */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locationConfirmed}
                    onChange={(e) => setLocationConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-emerald-800 rounded"
                  />
                  <span className="text-xs text-amber-950 leading-relaxed">
                    <strong>Konfirmasi Penyimpanan Data:</strong> Saya telah memeriksa pratinjau
                    peta di atas dan memastikan bahwa seluruh data masjid sudah lengkap, koordinat
                    latitude & longitude tidak tertukar, titik penanda sesuai lokasi masjid
                    sebenarnya, serta foto bukan berasal dari masjid lain.
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPreviewStep(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Kembali Perbaiki Data
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmSave}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? 'Menyimpan ke Database...' : 'Konfirmasi & Simpan Data Masjid'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
