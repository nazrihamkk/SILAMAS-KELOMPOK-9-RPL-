/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { MasjidItem } from '../../types/index.js';
import {
  HeartHandshake,
  User,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LayananPageProps {
  initialMasjidId?: string;
  onNavigateTracking: (kode: string) => void;
}

const KATEGORI_LAYANAN = [
  'Konsultasi Keagamaan & Keluarga',
  'Layanan Pengurusan & Mobil Ambulans Jenazah',
  'Penyaluran Bantuan Zakat, Infaq, Sedekah (ZIS) / Mustahik',
  'Permohonan Penceramah / Imam / Khotib',
  'Pendaftaran Mualaf & Pembinaan Ibadah',
  'Layanan Sosial & Kemasyarakatan Lainnya',
];

export const LayananPage: React.FC<LayananPageProps> = ({
  initialMasjidId,
  onNavigateTracking,
}) => {
  const [masjidList, setMasjidList] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMasjidId, setSelectedMasjidId] = useState(initialMasjidId || '');
  const [jenisLayanan, setJenisLayanan] = useState(KATEGORI_LAYANAN[0]);
  const [namaPemohon, setNamaPemohon] = useState('');
  const [nikPemohon, setNikPemohon] = useState('');
  const [kontakPemohon, setKontakPemohon] = useState('');
  const [alamatPemohon, setAlamatPemohon] = useState('');
  const [rincianKebutuhan, setRincianKebutuhan] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadMasjid() {
      try {
        const msj = await api.getMasjids();
        setMasjidList(msj);
        const defaultMasjid =
          initialMasjidId && msj.some((m) => m.id_masjid === initialMasjidId)
            ? initialMasjidId
            : msj[0]?.id_masjid || '';
        setSelectedMasjidId(defaultMasjid);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMasjid();
  }, [initialMasjidId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMasjidId || !jenisLayanan) {
      setErrorMsg('Silakan pilih masjid tujuan dan jenis layanan jemaah.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.submitLayanan({
        id_masjid: selectedMasjidId,
        jenis_layanan: jenisLayanan,
        nama_pemohon: namaPemohon,
        nik_pemohon: nikPemohon || '-',
        kontak_pemohon: kontakPemohon,
        alamat_pemohon: alamatPemohon,
        rincian_kebutuhan: rincianKebutuhan,
      });
      setSubmittedCode(created.kode_pelacakan);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim permohonan layanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    if (!submittedCode) return;
    navigator.clipboard.writeText(submittedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kepala Halaman Layanan */}
        <div className="bg-emerald-950 rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-800/70 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <HeartHandshake className="w-4 h-4" /> Pelayanan Ibadah & Sosial Umat
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              Pengajuan Layanan Jemaah & Kemasyarakatan
            </h1>
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-2xl">
              Sampaikan kebutuhan layanan keagamaan, sosial, konsultasi keluarga, bantuan ambulans jenazah, hingga penyaluran zakat/santunan kepada pengurus masjid secara mudah dan terdata.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Memuat formulir layanan jemaah...
          </div>
        ) : submittedCode ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-emerald-600 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Permohonan Layanan Jemaah Diterima!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
              Permohonan Anda telah masuk ke dalam sistem pengurus masjid dengan status awal{' '}
              <span className="font-bold text-amber-700">"Menunggu Verifikasi"</span>.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                KODE PENGAJUAN LAYANAN ANDA (SIMPAN KODE INI)
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="font-mono text-2xl font-bold text-emerald-900 tracking-wider">
                  {submittedCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                  title="Salin Kode Pengajuan"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-600 font-semibold mt-2">
                  Kode pengajuan berhasil disalin!
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigateTracking(submittedCode)}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                Cek Status Pengajuan <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSubmittedCode(null);
                  setRincianKebutuhan('');
                }}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors"
              >
                Ajukan Layanan Lainnya
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          >
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Masjid Tujuan Layanan *
                </label>
                <select
                  value={selectedMasjidId}
                  onChange={(e) => setSelectedMasjidId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {masjidList.map((m) => (
                    <option key={m.id_masjid} value={m.id_masjid}>
                      {m.nama_masjid} (Kel. {m.kelurahan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori Layanan Jemaah *
                </label>
                <select
                  value={jenisLayanan}
                  onChange={(e) => setJenisLayanan(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {KATEGORI_LAYANAN.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap Pemohon / Keluarga *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    placeholder="Masukkan nama lengkap pemohon"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor HP / WhatsApp yang Dapat Dihubungi *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={kontakPemohon}
                    onChange={(e) => setKontakPemohon(e.target.value)}
                    placeholder="Contoh: 0813-4122-9900"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NIK / Nomor Identitas (Opsional)
                </label>
                <input
                  type="text"
                  value={nikPemohon}
                  onChange={(e) => setNikPemohon(e.target.value)}
                  placeholder="Opsional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Lengkap Pemohon *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={alamatPemohon}
                    onChange={(e) => setAlamatPemohon(e.target.value)}
                    placeholder="Contoh: Jl. Sisingamangaraja No. 12, RT 02 / RW 01"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rincian Kebutuhan / Keterangan Permohonan *
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={4}
                  required
                  value={rincianKebutuhan}
                  onChange={(e) => setRincianKebutuhan(e.target.value)}
                  placeholder="Tuliskan penjelasan lengkap mengenai kebutuhan layanan, waktu, serta kondisi di lapangan..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                * Untuk kondisi darurat (seperti layanan ambulans jenazah), silakan hubungi juga nomor telepon pengurus pada halaman detail masjid.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-sm shrink-0"
              >
                {submitting ? 'Mengirim Permohonan...' : 'Kirim Permohonan Layanan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
