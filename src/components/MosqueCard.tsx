/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React from 'react';
import { MasjidItem } from '../types/index.js';
import { MapPin, Users, UserCheck, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  masjid: MasjidItem;
  onSelect: (id: string) => void;
  onPinjam?: (id: string) => void;
}

export const MosqueCard: React.FC<Props> = ({ masjid, onSelect, onPinjam }) => {
  const pengurusLabel =
    masjid.nama_pengurus_utama && masjid.nama_pengurus_utama.trim() !== ''
      ? masjid.nama_pengurus_utama
      : 'Belum tercatat';

  const fasilitasPreview = masjid.fasilitas_ringkas
    ? masjid.fasilitas_ringkas
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(' · ')
    : 'Tempat wudu · Pengeras suara';

  const hasValidCoords =
    typeof masjid.latitude === 'number' &&
    !isNaN(masjid.latitude) &&
    typeof masjid.longitude === 'number' &&
    !isNaN(masjid.longitude);

  const hasUploadedPhoto = Boolean(masjid.foto_url && masjid.foto_url.trim() !== '');

  // Nama wilayah ringkas tanpa awalan kata "Kelurahan"
  const wilayahRingkas = (masjid.kelurahan || '')
    .replace(/^kelurahan\s+/i, '')
    .replace(/^kel\.\s*/i, '')
    .trim();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Bagian Sampul: Menampilkan foto masjid jika tersedia, atau ikon masjid di tengah */}
      <div className="h-44 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 relative overflow-hidden flex flex-col justify-between p-4">
        {hasUploadedPhoto ? (
          <>
            <img
              src={masjid.foto_url}
              alt={masjid.nama_masjid}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-950/25" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            {/* Ikon masjid sebagai gambar bawaan di tengah area sampul */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-center text-emerald-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L9 8h6l-3-6zm0 7c-4.4 0-8 3.6-8 8v4h16v-4c0-4.4-3.6-8-8-8zm-5 10c.5-2.8 3-5 5-5s4.5 2.2 5 5H7z" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/85 to-transparent pointer-events-none" />
          </>
        )}

        {/* Baris Atas: Kiri = Kode Masjid, Kanan = Nama Wilayah Ringkas */}
        <div className="relative z-10 flex items-center justify-between gap-2 w-full">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-950/60 text-slate-200 backdrop-blur-xs border border-white/15">
            {masjid.id_masjid}
          </span>
          {wilayahRingkas && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700/85 text-white backdrop-blur-xs border border-emerald-400/25">
              {wilayahRingkas}
            </span>
          )}
        </div>

        {/* Judul Nama Masjid pada Sampul */}
        <div className="relative z-10 w-full pt-2">
          <h3 className="text-lg font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-100 transition-colors">
            {masjid.nama_masjid}
          </h3>
        </div>
      </div>

      {/* Bagian Isi Informasi Kartu */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-emerald-600 shrink-0" />
            <span className="line-clamp-2 leading-relaxed">{masjid.alamat}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {masjid.deskripsi}
          </p>

          {/* Ringkasan Fasilitas Utama */}
          <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 line-clamp-1">
            <strong className="text-slate-700">Fasilitas Utama:</strong> {fasilitasPreview}
          </div>

          {/* Informasi Kapasitas & Pengurus */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5" title="Kapasitas Jemaah">
              <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                {masjid.kapasitas_teks || `${masjid.kapasitas.toLocaleString('id-ID')} jemaah`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 max-w-[55%]" title="Pengurus Masjid">
              <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate text-slate-700">{pengurusLabel}</span>
            </div>
          </div>
        </div>

        {/* Tombol Tindakan Kartu */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onSelect(masjid.id_masjid)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors py-1 group/btn"
          >
            <span>Profil & Peta Lokasi</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-1.5">
            {hasValidCoords && (
              <a
                href={`https://www.google.com/maps?q=${masjid.latitude},${masjid.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka di Google Maps"
                className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {onPinjam && (
              <button
                onClick={() => onPinjam(masjid.id_masjid)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Pinjam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
