/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api.js';
import { MasjidItem } from '../../types/index.js';
import { MosqueCard } from '../../components/MosqueCard.js';
import { MosqueMap } from '../../components/MosqueMap.js';
import { Search, LayoutGrid, List, Building2, Map as MapIcon, ExternalLink, Navigation } from 'lucide-react';

interface Props {
  onSelectMasjid: (id: string) => void;
  onPinjamMasjid: (id: string) => void;
}

export const MasjidDirectoryPage: React.FC<Props> = ({ onSelectMasjid, onPinjamMasjid }) => {
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kelurahan, setKelurahan] = useState('Semua');
  const [minKapasitas, setMinKapasitas] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showMapOverview, setShowMapOverview] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getMasjids();
        setMasjids(data);
      } catch (err) {
        console.error('Failed to load masjids:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kelurahanOptions = useMemo(() => {
    const unique = Array.from(new Set(masjids.map((m) => m.kelurahan).filter(Boolean)));
    return ['Semua', ...unique];
  }, [masjids]);

  const filtered = masjids.filter((m) => {
    const matchKel = kelurahan === 'Semua' || m.kelurahan.toLowerCase() === kelurahan.toLowerCase();
    const matchKap = m.kapasitas >= minKapasitas;
    const q = search.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      m.nama_masjid.toLowerCase().includes(q) ||
      m.alamat.toLowerCase().includes(q) ||
      m.kelurahan.toLowerCase().includes(q) ||
      (m.fasilitas_ringkas && m.fasilitas_ringkas.toLowerCase().includes(q)) ||
      (m.nama_pengurus_utama && m.nama_pengurus_utama.toLowerCase().includes(q));
    return matchKel && matchKap && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Kepala Halaman */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Sistem Informasi Masjid</span>
            <span>·</span>
            <span>Wilayah Terdaftar</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Daftar Masjid & Fasilitas Ibadah
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Informasi lengkap daftar masjid terdaftar beserta alamat, kelurahan, kapasitas jemaah, perlengkapan fasilitas, pengurus masjid, dan peta lokasi.
          </p>
        </div>

        {/* Tombol Pengaturan Tampilan */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowMapOverview(!showMapOverview)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              showMapOverview
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMapOverview ? 'Sembunyikan Peta' : 'Tampilkan Peta'}</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bilah Pencarian dan Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Kolom pencarian */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama masjid, jalan, fasilitas, atau pengurus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Pilihan wilayah/kelurahan */}
          <div>
            <select
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {kelurahanOptions.map((k) => (
                <option key={k} value={k}>
                  {k === 'Semua' ? 'Semua Wilayah / Kelurahan' : `Kelurahan ${k}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filter kapasitas jemaah */}
          <div>
            <select
              value={minKapasitas}
              onChange={(e) => setMinKapasitas(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value={0}>Semua Kapasitas Jemaah</option>
              <option value={300}>Minimal 300 jemaah</option>
              <option value={500}>Minimal 500 jemaah</option>
              <option value={1000}>Minimal 1.000 jemaah</option>
            </select>
          </div>
        </div>

        {/* Tombol Atur Ulang Filter */}
        {(search || kelurahan !== 'Semua' || minKapasitas > 0) && (
          <div className="flex items-center justify-end text-xs text-slate-500 pt-1 border-t border-slate-100">
            <button
              onClick={() => {
                setSearch('');
                setKelurahan('Semua');
                setMinKapasitas(0);
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Atur Ulang Filter Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Peta Sebaran Lokasi Masjid */}
      {showMapOverview && !loading && filtered.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Peta Lokasi Masjid
              </h2>
              <p className="text-xs text-slate-500">
                Pilih penanda pada peta untuk melihat nama, alamat, dan profil masjid.
              </p>
            </div>
          </div>
          <MosqueMap
            masjids={filtered}
            height="360px"
            onSelectMasjid={onSelectMasjid}
            showExternalButtons={false}
          />
        </div>
      )}

      {/* Daftar Masjid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Tidak ada masjid yang sesuai pencarian</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Silakan ubah kata kunci pencarian atau pilih semua wilayah dan kapasitas di atas.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <MosqueCard
              key={m.id_masjid}
              masjid={m}
              onSelect={onSelectMasjid}
              onPinjam={onPinjamMasjid}
            />
          ))}
        </div>
      ) : (
        /* Tampilan Tabel Daftar Masjid */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nama Masjid</th>
                  <th className="py-3 px-4">Kelurahan</th>
                  <th className="py-3 px-4">Alamat</th>
                  <th className="py-3 px-4">Kapasitas</th>
                  <th className="py-3 px-4">Pengurus</th>
                  <th className="py-3 px-4">Fasilitas Utama</th>
                  <th className="py-3 px-4 text-right">Aksi & Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id_masjid} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{m.nama_masjid}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.kelurahan}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{m.alamat}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {m.kapasitas_teks || `${m.kapasitas.toLocaleString('id-ID')} jemaah`}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {m.nama_pengurus_utama || 'Belum tercatat'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {m.fasilitas_ringkas
                        ? m.fasilitas_ringkas.split(';').slice(0, 3).join(', ')
                        : 'Tempat wudu, Pengeras suara'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`https://www.google.com/maps?q=${m.latitude},${m.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Buka di Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Petunjuk Arah"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => onSelectMasjid(m.id_masjid)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Profil & Peta
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
