/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { MasjidItem, FasilitasItem } from '../../types/index.js';
import {
  PackageCheck,
  Calendar,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
  Building2,
  Clock,
  Mail,
} from 'lucide-react';

interface PeminjamanPageProps {
  initialMasjidId?: string;
  onNavigateTracking: (kode: string) => void;
}

export const PeminjamanPage: React.FC<PeminjamanPageProps> = ({
  initialMasjidId,
  onNavigateTracking,
}) => {
  const [masjidList, setMasjidList] = useState<MasjidItem[]>([]);
  const [fasilitasList, setFasilitasList] = useState<FasilitasItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMasjidId, setSelectedMasjidId] = useState(initialMasjidId || '');
  const [selectedFasilitasId, setSelectedFasilitasId] = useState('');
  const [namaPemohon, setNamaPemohon] = useState('');
  const [nikPemohon, setNikPemohon] = useState('');
  const [kontakPemohon, setKontakPemohon] = useState('');
  const [emailPemohon, setEmailPemohon] = useState('');
  const [alamatPemohon, setAlamatPemohon] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('08:00 WITA');
  const [waktuSelesai, setWaktuSelesai] = useState('14:00 WITA');
  const [tujuanPeminjaman, setTujuanPeminjaman] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [msj, fas] = await Promise.all([api.getMasjids(), api.getFasilitas()]);
        setMasjidList(msj);
        setFasilitasList(fas);
        const defaultMasjid = initialMasjidId && msj.some(m => m.id_masjid === initialMasjidId)
          ? initialMasjidId
          : msj[0]?.id_masjid || '';
        setSelectedMasjidId(defaultMasjid);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialMasjidId]);

  const availableFasilitas = fasilitasList.filter(
    (f) => f.id_masjid === selectedMasjidId && f.bisa_dipinjam && f.kondisi === 'Baik'
  );

  const currentFasilitas = availableFasilitas.find((f) => f.id_fasilitas === selectedFasilitasId);

  const handleMasjidChange = (id: string) => {
    setSelectedMasjidId(id);
    setSelectedFasilitasId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMasjidId || !selectedFasilitasId) {
      setErrorMsg('Silakan pilih masjid dan perlengkapan/fasilitas yang ingin dipinjam.');
      return;
    }

    if (tanggalSelesai && tanggalMulai && tanggalSelesai < tanggalMulai) {
      setErrorMsg('Tanggal selesai tidak boleh lebih awal dari tanggal mulai peminjaman.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.submitPeminjaman({
        id_masjid: selectedMasjidId,
        id_fasilitas: selectedFasilitasId,
        nama_pemohon: namaPemohon,
        nik_pemohon: nikPemohon || '-',
        kontak_pemohon: kontakPemohon,
        email_pemohon: emailPemohon || '-',
        alamat_pemohon: alamatPemohon,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai || tanggalMulai,
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai,
        tujuan_peminjaman: tujuanPeminjaman,
      });
      setSubmittedCode(created.kode_pelacakan);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim permohonan.');
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
        {/* Kepala Halaman Formulir */}
        <div className="bg-emerald-950 rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-800/70 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <PackageCheck className="w-4 h-4" /> Formulir Layanan Umat
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              Permohonan Pinjam Perlengkapan & Fasilitas Masjid
            </h1>
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-2xl">
              Ajukan peminjaman perlengkapan dan sarana masjid secara mudah dan transparan. Setelah formulir dikirim, Anda akan mendapatkan <strong>Kode Pengajuan</strong> untuk mengecek persetujuan pengurus.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
            Memuat daftar masjid dan perlengkapan...
          </div>
        ) : submittedCode ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-emerald-600 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Permohonan Peminjaman Berhasil Dikirim!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
              Data pengajuan Anda telah tercatat di sistem SILAMAS dengan status awal{' '}
              <span className="font-bold text-amber-700">"Menunggu Verifikasi"</span> oleh Pengurus Masjid terkait.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                KODE PENGAJUAN ANDA (SIMPAN KODE INI)
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
                Cek Status Pengajuan Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSubmittedCode(null);
                  setTujuanPeminjaman('');
                  setSelectedFasilitasId('');
                }}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors"
              >
                Buat Permohonan Baru
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

            {/* Langkah 1: Pilih Masjid & Fasilitas */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> 1. Pilih Masjid & Perlengkapan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Masjid Tujuan *
                  </label>
                  <select
                    value={selectedMasjidId}
                    onChange={(e) => handleMasjidChange(e.target.value)}
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
                    Perlengkapan / Fasilitas yang Tersedia *
                  </label>
                  <select
                    value={selectedFasilitasId}
                    onChange={(e) => setSelectedFasilitasId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">-- Pilih Perlengkapan --</option>
                    {availableFasilitas.map((f) => (
                      <option key={f.id_fasilitas} value={f.id_fasilitas}>
                        {f.nama_fasilitas} (Tersedia: {f.jumlah} unit)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentFasilitas && (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
                  <div>
                    <span className="font-bold">{currentFasilitas.nama_fasilitas}</span> —{' '}
                    {currentFasilitas.keterangan}
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-200/70 text-emerald-900 font-bold">
                    Jumlah Tersedia: {currentFasilitas.jumlah} unit ({currentFasilitas.kondisi})
                  </span>
                </div>
              )}
            </div>

            <hr className="border-slate-200" />

            {/* Langkah 2: Identitas Pemohon */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> 2. Data Diri Pemohon
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap Pemohon / Penanggung Jawab *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Fauzi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor HP / WhatsApp Aktif *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={kontakPemohon}
                      onChange={(e) => setKontakPemohon(e.target.value)}
                      placeholder="Contoh: 0812-4567-8901"
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
                    placeholder="16 digit NIK KTP (opsional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Email (Opsional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailPemohon}
                      onChange={(e) => setEmailPemohon(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Lengkap Pemohon / Asal Warga *
                  </label>
                  <input
                    type="text"
                    required
                    value={alamatPemohon}
                    onChange={(e) => setAlamatPemohon(e.target.value)}
                    placeholder="Contoh: Jl. R.A. Kartini No. 12, RT 03 / RW 01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Langkah 3: Detail & Waktu Peminjaman */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 3. Jadwal & Keperluan Peminjaman
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tanggal Mulai Pinjam *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => {
                      setTanggalMulai(e.target.value);
                      if (!tanggalSelesai) setTanggalSelesai(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tanggal Selesai / Kembali *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Jam Mulai *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={waktuMulai}
                      onChange={(e) => setWaktuMulai(e.target.value)}
                      placeholder="08:00 WITA"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Jam Selesai *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={waktuSelesai}
                      onChange={(e) => setWaktuSelesai(e.target.value)}
                      placeholder="14:00 WITA"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Keperluan / Tujuan Penggunaan *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    required
                    value={tujuanPeminjaman}
                    onChange={(e) => setTujuanPeminjaman(e.target.value)}
                    placeholder="Jelaskan kegiatan atau keperluan peminjaman perlengkapan secara jelas..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                * Pemohon wajib menjaga keutuhan dan kebersihan perlengkapan milik masjid hingga dikembalikan.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-sm shrink-0"
              >
                {submitting ? 'Mengirim Pengajuan...' : 'Kirim Permohonan Pinjam'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
