/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { MasjidItem } from '../../types/index.js';
import { MosqueMap } from '../../components/MosqueMap.js';
import {
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ExternalLink,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  masjidId: string;
  onBack: () => void;
  onNavigatePeminjaman: (id_masjid: string) => void;
  onNavigateLayanan: (id_masjid: string) => void;
}

export const MasjidDetailPage: React.FC<Props> = ({
  masjidId,
  onBack,
  onNavigatePeminjaman,
  onNavigateLayanan,
}) => {
  const [masjid, setMasjid] = useState<MasjidItem | null>(null);
  const [activeTab, setActiveTab] = useState<'fasilitas' | 'pengurus' | 'kegiatan' | 'pengumuman'>('fasilitas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const data = await api.getMasjidDetail(masjidId);
        setMasjid(data);
      } catch (err) {
        console.error('Failed to load masjid detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [masjidId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Memuat informasi lengkap masjid...</p>
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Data masjid tidak ditemukan</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl"
        >
          Kembali ke Daftar Masjid
        </button>
      </div>
    );
  }

  const fasilitasTags = masjid.fasilitas_ringkas
    ? masjid.fasilitas_ringkas
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const fasilitasUtamaRingkas =
    fasilitasTags.length > 0
      ? fasilitasTags.slice(0, 3).join(', ')
      : 'Tempat wudu, Karpet, Pengeras suara';

  const pengurusUtama =
    masjid.nama_pengurus_utama && masjid.nama_pengurus_utama.trim() !== ''
      ? masjid.nama_pengurus_utama
      : 'Belum tercatat';

  const hasUploadedPhoto = Boolean(masjid.foto_url && masjid.foto_url.trim() !== '');
  const googleMapsUrl = `https://www.google.com/maps?q=${masjid.latitude},${masjid.longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${masjid.latitude},${masjid.longitude}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Tombol kembali ke daftar masjid */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Masjid</span>
      </button>

      {/* Kepala Profil Utama Masjid */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 relative">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-semibold">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/70 text-emerald-200 border border-white/15 font-mono">
                  {masjid.id_masjid}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-white border border-emerald-600/50">
                  {(masjid.kelurahan || '').replace(/^kelurahan\s+/i, '').trim()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {masjid.nama_masjid}
              </h1>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-200 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <span>{masjid.alamat}</span>
              </div>
            </div>

            {/* Tombol Google Maps & Petunjuk Arah */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors backdrop-blur-xs"
              >
                <ExternalLink className="w-4 h-4 text-emerald-300" />
                <span>Buka di Google Maps</span>
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>Petunjuk Arah</span>
              </a>
            </div>
          </div>
        </div>

        {/* Empat Kartu Ringkasan Informasi Utama */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-slate-500 block">Kapasitas Jemaah</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {masjid.kapasitas_teks || `${masjid.kapasitas.toLocaleString('id-ID')} jemaah`}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-slate-500 block">Pengurus Masjid</span>
            <span className="text-base font-bold text-slate-900 mt-1 block truncate" title={pengurusUtama}>
              {pengurusUtama}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-slate-500 block">Kelurahan / Wilayah</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {masjid.kelurahan}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-slate-500 block">Fasilitas Utama</span>
            <span className="text-sm font-bold text-emerald-800 mt-1 block truncate" title={fasilitasUtamaRingkas}>
              {fasilitasUtamaRingkas}
            </span>
          </div>
        </div>

        {/* Bilah Kontak & Tombol Layanan */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {masjid.telepon && masjid.telepon !== '-' && (
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {masjid.telepon}
              </span>
            )}
            {masjid.email && masjid.email !== '-' && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {masjid.email}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Layanan & Informasi Masjid Aktif
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigatePeminjaman(masjid.id_masjid)}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
            >
              Pinjam Perlengkapan & Fasilitas
            </button>
            <button
              onClick={() => onNavigateLayanan(masjid.id_masjid)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Ajukan Layanan Jemaah
            </button>
          </div>
        </div>
      </div>

      {/* Kolom Foto, Deskripsi, dan Peta Lokasi Interaktif */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri: Foto & Deskripsi Masjid */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Kartu Foto Masjid atau Ikon Masjid Bawaan */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {hasUploadedPhoto ? (
              <div className="relative h-60 bg-slate-900">
                <img
                  src={masjid.foto_url}
                  alt={masjid.nama_masjid}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-56 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-md">
                  <div className="w-14 h-14 rounded-xl bg-emerald-600/90 flex items-center justify-center text-white shadow-xs">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2L9 8h6l-3-6zm0 7c-4.4 0-8 3.6-8 8v4h16v-4c0-4.4-3.6-8-8-8zm-5 10c.5-2.8 3-5 5-5s4.5 2.2 5 5H7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deskripsi & Ringkasan Fasilitas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Profil & Deskripsi Masjid
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {masjid.deskripsi}
              </p>
            </div>

            {fasilitasTags.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Fasilitas Utama Masjid
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {fasilitasTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Peta Lokasi Interaktif */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Peta Lokasi Masjid
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan peta interaktif atau tombol di bawah untuk membuka Google Maps dan melihat petunjuk arah menuju masjid.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <MosqueMap
              masjids={[masjid]}
              selectedMasjid={masjid}
              height="380px"
              showExternalButtons={true}
            />
          </div>
        </div>
      </div>

      {/* Tab Rincian Informasi Masjid */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('fasilitas')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'fasilitas'
                ? 'border-b-2 border-emerald-700 text-emerald-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Perlengkapan & Fasilitas ({masjid.fasilitas?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('pengurus')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pengurus'
                ? 'border-b-2 border-emerald-700 text-emerald-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pengurus Masjid ({masjid.pengurus?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('kegiatan')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'kegiatan'
                ? 'border-b-2 border-emerald-700 text-emerald-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Jadwal Kegiatan ({masjid.kegiatan?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('pengumuman')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pengumuman'
                ? 'border-b-2 border-emerald-700 text-emerald-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pengumuman Masjid ({masjid.pengumuman?.length || 0})
          </button>
        </div>

        {/* Tab 1: Fasilitas */}
        {activeTab === 'fasilitas' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Daftar Perlengkapan & Fasilitas Masjid
              </span>
              <button
                onClick={() => onNavigatePeminjaman(masjid.id_masjid)}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                + Pinjam Fasilitas Masjid Ini
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Perlengkapan / Fasilitas</th>
                    <th className="py-3 px-4 text-center">Jumlah</th>
                    <th className="py-3 px-4 text-center">Kondisi</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-center">Status Pinjam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {masjid.fasilitas?.map((f) => (
                    <tr key={f.id_fasilitas} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{f.nama_fasilitas}</td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">{f.jumlah}</td>
                      <td className="py-3 px-4 text-center">
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
                      <td className="py-3 px-4 text-slate-600 max-w-md">{f.keterangan || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        {f.bisa_dipinjam ? (
                          <span className="text-emerald-700 font-semibold">Bisa Dipinjam</span>
                        ) : (
                          <span className="text-slate-400">Digunakan di Masjid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!masjid.fasilitas || masjid.fasilitas.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Belum ada rincian perlengkapan fasilitas yang ditambahkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Pengurus */}
        {activeTab === 'pengurus' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {masjid.pengurus?.map((p) => (
              <div key={p.id_pengurus} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  {p.jabatan}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{p.nama_pengurus}</h4>
                <div className="text-xs text-slate-500 space-y-1 pt-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.kontak || 'Belum tercatat'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Masa Tugas:</span> {p.periode}
                  </div>
                </div>
              </div>
            ))}
            {(!masjid.pengurus || masjid.pengurus.length === 0) && (
              <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                Pengurus Utama: <strong>{pengurusUtama}</strong>. Rincian susunan pengurus lainnya belum tercatat di sistem.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Kegiatan */}
        {activeTab === 'kegiatan' && (
          <div className="space-y-3">
            {masjid.kegiatan?.map((k) => (
              <div key={k.id_kegiatan} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                      {k.tanggal}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">· {k.waktu}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{k.nama_kegiatan}</h4>
                  {k.penceramah && (
                    <p className="text-xs text-slate-600">
                      Penceramah / Pengisi: <strong className="text-slate-800">{k.penceramah}</strong>
                    </p>
                  )}
                  <p className="text-xs text-slate-500">{k.keterangan}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {k.status}
                  </span>
                </div>
              </div>
            ))}
            {(!masjid.kegiatan || masjid.kegiatan.length === 0) && (
              <div className="py-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Belum ada jadwal kegiatan masjid yang terdaftar.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Pengumuman */}
        {activeTab === 'pengumuman' && (
          <div className="space-y-3">
            {masjid.pengumuman?.map((pgm) => (
              <div key={pgm.id_pengumuman} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">{pgm.kategori}</span>
                  <span className="text-[11px] font-mono text-slate-400">{pgm.tanggal}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{pgm.judul}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{pgm.isi}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Disampaikan oleh: <strong className="text-slate-600">{pgm.penulis}</strong>
                </div>
              </div>
            ))}
            {(!masjid.pengumuman || masjid.pengumuman.length === 0) && (
              <div className="py-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Belum ada pengumuman aktif untuk masjid ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
