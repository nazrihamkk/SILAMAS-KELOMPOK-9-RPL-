/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  MasjidItem,
  FasilitasItem,
  PengurusItem,
  KegiatanItem,
  PeminjamanItem,
  LayananItem,
} from '../../types/index.js';
import { Printer, FileSpreadsheet, FileText, Info, CheckCircle2, Clock } from 'lucide-react';

export const AdminLaporanPage: React.FC = () => {
  const [masjidList, setMasjidList] = useState<MasjidItem[]>([]);
  const [fasilitasList, setFasilitasList] = useState<FasilitasItem[]>([]);
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([]);
  const [kegiatanList, setKegiatanList] = useState<KegiatanItem[]>([]);
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanItem[]>([]);
  const [layananList, setLayananList] = useState<LayananItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedKelurahan, setSelectedKelurahan] = useState('Semua');
  const [periodeData, setPeriodeData] = useState(
    new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  );

  useEffect(() => {
    async function loadSummaryData() {
      try {
        const [msj, fas, png, kgt, pmj, lyn] = await Promise.all([
          api.getMasjids(),
          api.getFasilitas(),
          api.getPengurus(),
          api.getKegiatan(),
          api.getPeminjaman(),
          api.getLayanan(),
        ]);
        setMasjidList(msj);
        setFasilitasList(fas);
        setPengurusList(png);
        setKegiatanList(kgt);
        setPeminjamanList(pmj);
        setLayananList(lyn);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSummaryData();
  }, []);

  const kelurahanList = [
    'Semua',
    ...Array.from(new Set(masjidList.map((m) => m.kelurahan).filter(Boolean))).sort(),
  ];

  const filteredMasjid =
    selectedKelurahan === 'Semua'
      ? masjidList
      : masjidList.filter((m) => m.kelurahan === selectedKelurahan);

  const totalKapasitas = filteredMasjid.reduce((acc, m) => acc + (m.kapasitas || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'id_masjid',
      'nama_masjid',
      'alamat',
      'kelurahan',
      'wilayah',
      'latitude',
      'longitude',
      'kapasitas_jamaah',
      'fasilitas',
      'pengurus_utama',
      'status_verifikasi',
      'catatan_verifikasi',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = filteredMasjid.map((m) => [
      m.id_masjid,
      m.nama_masjid,
      m.alamat,
      m.kelurahan,
      m.kecamatan || 'Wilayah Terdaftar',
      m.latitude,
      m.longitude,
      m.kapasitas_teks || `${m.kapasitas} jemaah`,
      m.fasilitas_ringkas || '-',
      m.nama_pengurus_utama && !m.nama_pengurus_utama.toLowerCase().includes('belum tercatat')
        ? m.nama_pengurus_utama
        : 'Belum tercatat',
      m.status_verifikasi || 'Terverifikasi',
      m.catatan_verifikasi || 'Belum diverifikasi',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Ringkasan_Data_Masjid_SILAMAS_${periodeData.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTXT = () => {
    const lines: string[] = [
      '========================================================================',
      'PUSAT RINGKASAN DATA SILAMAS — RINGKASAN DATA MASJID',
      '========================================================================',
      `Judul Ringkasan : Ringkasan Data Masjid Terdaftar pada Sistem SILAMAS`,
      `Periode Data    : ${periodeData}`,
      `Filter Wilayah  : ${
        selectedKelurahan === 'Semua'
          ? 'Seluruh Kelurahan Terdaftar'
          : `Kelurahan ${selectedKelurahan}`
      }`,
      `Jumlah Masjid   : ${filteredMasjid.length} Masjid`,
      `Estimasi Daya Tampung : ± ${totalKapasitas.toLocaleString('id-ID')} Jemaah`,
      '------------------------------------------------------------------------',
      '',
    ];

    filteredMasjid.forEach((m, idx) => {
      const pengurusLabel =
        m.nama_pengurus_utama && !m.nama_pengurus_utama.toLowerCase().includes('belum tercatat')
          ? m.nama_pengurus_utama
          : 'Belum tercatat';

      lines.push(`${idx + 1}. ${m.nama_masjid} (${m.id_masjid})`);
      lines.push(`   Alamat              : ${m.alamat}`);
      lines.push(`   Kelurahan / Wilayah : Kel. ${m.kelurahan}, ${m.kecamatan || '-'}`);
      lines.push(`   Titik Koordinat     : ${m.latitude}, ${m.longitude}`);
      lines.push(`   Kapasitas           : ${m.kapasitas_teks || `± ${m.kapasitas} jemaah`}`);
      lines.push(`   Fasilitas           : ${m.fasilitas_ringkas || '-'}`);
      lines.push(`   Pengurus            : ${pengurusLabel}`);
      lines.push(
        `   Status & Catatan    : ${m.status_verifikasi || 'Terverifikasi'} — ${
          m.catatan_verifikasi || 'Belum diverifikasi'
        }`
      );
      lines.push('');
    });

    lines.push('------------------------------------------------------------------------');
    lines.push(
      'Catatan Penting: “Dokumen ini merupakan ringkasan informasi dari sistem SILAMAS dan bukan surat, sertifikat, keputusan, izin, atau dokumen resmi instansi pemerintah.”'
    );
    lines.push('========================================================================');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ringkasan_Data_Masjid_SILAMAS_${periodeData.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Memuat ringkasan data masjid dari sistem SILAMAS...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Bilah Filter dan Tombol Unduh/Cetak (Disembunyikan saat dicetak) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900">
            Pusat Ringkasan Data SILAMAS
          </h2>
          <p className="text-xs text-slate-500">
            Ringkasan Data Masjid, fasilitas, kapasitas, koordinat lokasi, dan status pencatatan dalam sistem aplikasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedKelurahan}
            onChange={(e) => setSelectedKelurahan(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {kelurahanList.map((kel) => (
              <option key={kel} value={kel}>
                {kel === 'Semua' ? 'Semua Wilayah / Kelurahan' : `Kelurahan ${kel}`}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={periodeData}
            onChange={(e) => setPeriodeData(e.target.value)}
            placeholder="Periode Data"
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Unduh Ringkasan (CSV)
          </button>

          <button
            onClick={handleDownloadTXT}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-700" /> Unduh Ringkasan (TXT)
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak Data (PDF)
          </button>
        </div>
      </div>

      {/* Dokumen Ringkasan Data Siap Cetak */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs print:shadow-none print:border-none print:p-0">
        {/* Bagian Kepala Dokumen Ringkasan */}
        <div className="border-b-2 border-emerald-900 pb-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-2">
              Pusat Ringkasan Data SILAMAS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Ringkasan Data Masjid
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Sistem Informasi Manajemen Layanan & Administrasi Masjid (SILAMAS)
            </p>
          </div>
          <div className="text-xs text-slate-600 sm:text-right space-y-0.5">
            <p>
              <strong>Periode Data:</strong> {periodeData}
            </p>
            <p>
              <strong>Cakupan Wilayah:</strong>{' '}
              {selectedKelurahan === 'Semua'
                ? 'Seluruh Kelurahan Terdaftar'
                : `Kelurahan ${selectedKelurahan}`}
            </p>
            <p>
              <strong>Tanggal Cetak Sistem:</strong>{' '}
              {new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Ringkasan Angka Utama */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Masjid Terdata</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {filteredMasjid.length} Masjid
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Estimasi Daya Tampung</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              ± {totalKapasitas.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-normal">Jemaah</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Perlengkapan & Kegiatan</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {fasilitasList.length}{' '}
              <span className="text-xs font-normal">Sarana / {kegiatanList.length} Agenda</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Pengajuan Layanan & Pinjam</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {peminjamanList.length + layananList.length}{' '}
              <span className="text-xs font-normal">Permohonan</span>
            </p>
          </div>
        </div>

        {/* Tabel 1: Ringkasan Data Utama Masjid */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
            I. Tabel Ringkasan Profil, Lokasi, Fasilitas, dan Pengurus Masjid
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 px-3 py-2.5 text-center w-10">No</th>
                  <th className="border border-slate-300 px-3 py-2.5">Nama Masjid & Alamat</th>
                  <th className="border border-slate-300 px-3 py-2.5">Kelurahan / Wilayah</th>
                  <th className="border border-slate-300 px-3 py-2.5">Kapasitas</th>
                  <th className="border border-slate-300 px-3 py-2.5">Titik Koordinat</th>
                  <th className="border border-slate-300 px-3 py-2.5">Fasilitas Utama</th>
                  <th className="border border-slate-300 px-3 py-2.5">Pengurus</th>
                  <th className="border border-slate-300 px-3 py-2.5">Catatan / Status Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredMasjid.map((m, idx) => {
                  const pengurusRecorded =
                    m.nama_pengurus_utama &&
                    !m.nama_pengurus_utama.toLowerCase().includes('belum tercatat');
                  const extraPengurusCount = pengurusList.filter(
                    (p) => p.id_masjid === m.id_masjid
                  ).length;

                  return (
                    <tr key={m.id_masjid} className="align-top">
                      <td className="border border-slate-300 px-3 py-2.5 text-center font-medium">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5">
                        <p className="font-bold text-slate-900">{m.nama_masjid}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{m.alamat}</p>
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5">
                        <span className="font-semibold text-slate-800">Kel. {m.kelurahan}</span>
                        <span className="block text-[11px] text-slate-500">
                          {m.kecamatan || '-'}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5">
                        {m.kapasitas_teks || `± ${m.kapasitas} jemaah`}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 font-mono text-[11px] text-slate-800">
                        {m.latitude.toFixed(6)},
                        <br />
                        {m.longitude.toFixed(6)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-[11px] text-slate-700 max-w-xs">
                        {m.fasilitas_ringkas || 'Belum tercatat'}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5">
                        {pengurusRecorded ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {m.nama_pengurus_utama}
                            </span>
                            {extraPengurusCount > 0 && (
                              <span className="block text-[10px] text-emerald-700">
                                ({extraPengurusCount} pengurus tercatat)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
                            <Clock className="w-3 h-3" /> Belum tercatat
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5">
                        {m.status_verifikasi === 'Belum diverifikasi' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold mb-1">
                            Belum diverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold mb-1">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi Sistem
                          </span>
                        )}
                        <p className="text-[11px] text-slate-600">
                          {m.catatan_verifikasi || 'Belum diverifikasi'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel 2: Ringkasan Permohonan Pinjam & Layanan */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
            II. Ringkasan Permohonan Pinjam Perlengkapan & Layanan Jemaah
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 px-3 py-2">Kode Pengajuan</th>
                  <th className="border border-slate-300 px-3 py-2">Kategori</th>
                  <th className="border border-slate-300 px-3 py-2">Nama Pemohon</th>
                  <th className="border border-slate-300 px-3 py-2">Masjid Tujuan</th>
                  <th className="border border-slate-300 px-3 py-2">Rincian Pengajuan</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Status Sistem</th>
                </tr>
              </thead>
              <tbody>
                {peminjamanList.map((p) => (
                  <tr key={p.id_peminjaman}>
                    <td className="border border-slate-300 px-3 py-2 font-mono font-bold">
                      {p.kode_pelacakan}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">Peminjaman Fasilitas</td>
                    <td className="border border-slate-300 px-3 py-2">{p.nama_pemohon}</td>
                    <td className="border border-slate-300 px-3 py-2">{p.nama_masjid}</td>
                    <td className="border border-slate-300 px-3 py-2">
                      {p.nama_fasilitas} — {p.tujuan_peminjaman}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-center font-bold">
                      {p.status}
                    </td>
                  </tr>
                ))}
                {layananList.map((l) => (
                  <tr key={l.id_layanan}>
                    <td className="border border-slate-300 px-3 py-2 font-mono font-bold">
                      {l.kode_pelacakan}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">Layanan Jemaah</td>
                    <td className="border border-slate-300 px-3 py-2">{l.nama_pemohon}</td>
                    <td className="border border-slate-300 px-3 py-2">{l.nama_masjid}</td>
                    <td className="border border-slate-300 px-3 py-2">{l.jenis_layanan}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center font-bold">
                      {l.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kotak Keterangan Dokumen Sistem */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 mb-0.5">Keterangan Dokumen Sistem:</p>
            <p className="italic">
              “Dokumen ini merupakan ringkasan informasi dari sistem SILAMAS dan bukan surat, sertifikat, keputusan, izin, atau dokumen resmi instansi pemerintah.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
