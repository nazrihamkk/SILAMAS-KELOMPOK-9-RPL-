import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { LogIn, LayoutDashboard, LogOut } from 'lucide-react';

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  onNavigateDetail?: (id: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Identitas Utama SILAMAS */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L9 8h6l-3-6zm0 7c-4.4 0-8 3.6-8 8v4h16v-4c0-4.4-3.6-8-8-8zm-5 10c.5-2.8 3-5 5-5s4.5 2.2 5 5H7z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                SILAMAS
              </span>
            </div>
          </button>

          {/* Tautan Navigasi Utama */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentView('home')}
              className={`transition-colors pb-0.5 hover:text-slate-900 ${
                currentView === 'home' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentView('direktori')}
              className={`transition-colors pb-0.5 hover:text-slate-900 ${
                currentView === 'direktori' || currentView === 'detail'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Daftar Masjid
            </button>
            <button
              onClick={() => setCurrentView('peminjaman')}
              className={`transition-colors pb-0.5 hover:text-slate-900 ${
                currentView === 'peminjaman' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
              }`}
            >
              Pinjam Fasilitas
            </button>
            <button
              onClick={() => setCurrentView('layanan')}
              className={`transition-colors pb-0.5 hover:text-slate-900 ${
                currentView === 'layanan' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
              }`}
            >
              Layanan Jemaah
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`transition-colors pb-0.5 hover:text-slate-900 ${
                currentView === 'tracking' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
              }`}
            >
              Cek Status Pengajuan
            </button>
          </nav>

          {/* Tombol Aksi Pengurus */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('admin')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Ruang Pengurus</span>
                </button>
                <button
                  onClick={logout}
                  title="Keluar"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Pengurus</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigasi layar perangkat seluler */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-4 text-xs font-medium border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setCurrentView('home')}
            className={`whitespace-nowrap ${currentView === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
          >
            Beranda
          </button>
          <button
            onClick={() => setCurrentView('direktori')}
            className={`whitespace-nowrap ${
              currentView === 'direktori' || currentView === 'detail' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            Daftar Masjid
          </button>
          <button
            onClick={() => setCurrentView('peminjaman')}
            className={`whitespace-nowrap ${currentView === 'peminjaman' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
          >
            Pinjam Fasilitas
          </button>
          <button
            onClick={() => setCurrentView('layanan')}
            className={`whitespace-nowrap ${currentView === 'layanan' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
          >
            Layanan Jemaah
          </button>
          <button
            onClick={() => setCurrentView('tracking')}
            className={`whitespace-nowrap ${currentView === 'tracking' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
          >
            Cek Status Pengajuan
          </button>
        </div>
      </div>
    </header>
  );
};
