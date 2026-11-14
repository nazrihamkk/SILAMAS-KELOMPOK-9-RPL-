import React from 'react';

interface Props {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<Props> = ({ setCurrentView }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Informasi Sistem & Tim Pengembang */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L9 8h6l-3-6zm0 7c-4.4 0-8 3.6-8 8v4h16v-4c0-4.4-3.6-8-8-8zm-5 10c.5-2.8 3-5 5-5s4.5 2.2 5 5H7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SILAMAS</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Sistem Informasi Manajemen Layanan dan Administrasi Masjid (SILAMAS) berbasis web dirancang untuk memudahkan pendataan profil masjid, perlengkapan fasilitas, kepengurusan masjid, jadwal kegiatan, serta pelayanan masyarakat dan jemaah di berbagai wilayah terdaftar.
            </p>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
              <p className="font-medium text-slate-300">Tim Pengembang (Kelompok 9):</p>
              <p className="mt-1">1. Nadya Syahara Salihin (F5512510002)</p>
              <p>2. Nazril Ilham Kakame (F5512510026)</p>
              <p>3. Giri Ariska Putri (F5512510035)</p>
              <p className="mt-1 text-slate-400">Program Studi S1 Teknik Informatika · Fakultas Teknik · Universitas Tadulako</p>
            </div>
          </div>

          {/* Tautan Cepat Layanan */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Menu Layanan Umat</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('direktori')} className="hover:text-emerald-400 transition-colors">
                  Daftar & Profil Masjid
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('peminjaman')} className="hover:text-emerald-400 transition-colors">
                  Pinjam Perlengkapan & Fasilitas
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('layanan')} className="hover:text-emerald-400 transition-colors">
                  Permohonan Layanan Jemaah
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('tracking')} className="hover:text-emerald-400 transition-colors">
                  Cek Status Pengajuan
                </button>
              </li>
            </ul>
          </div>

          {/* Daftar Wilayah */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Wilayah Terdaftar</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>· Kelurahan Lolu Utara</p>
              <p>· Kelurahan Lolu Selatan</p>
              <p>· Kelurahan Besusu Barat</p>
              <p>· Kelurahan Besusu Tengah</p>
              <p>· Kelurahan Besusu Timur</p>
              <div className="pt-3">
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Masuk Pengurus Masjid →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SILAMAS — Sistem Informasi Masjid. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-slate-400 font-mono text-[11px]">Transparansi Data & Kemudahan Layanan Umat</p>
        </div>
      </div>
    </footer>
  );
};
