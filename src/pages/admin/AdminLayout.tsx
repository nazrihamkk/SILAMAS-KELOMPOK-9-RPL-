/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Calendar,
  Megaphone,
  ClipboardCheck,
  HeartHandshake,
  FileBarChart,
  UserCog,
  LogOut,
  Globe,
  Landmark,
  RotateCcw,
} from 'lucide-react';

interface AdminLayoutProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  onExitToPublic: () => void;
  onResetDb: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeModule,
  setActiveModule,
  onExitToPublic,
  onResetDb,
  children,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: string; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Ringkasan Sistem', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'masjid', label: 'Kelola Data Masjid', icon: <Building2 className="w-4 h-4" /> },
    { id: 'fasilitas', label: 'Perlengkapan & Fasilitas', icon: <Package className="w-4 h-4" /> },
    { id: 'pengurus', label: 'Pengurus Masjid', icon: <Users className="w-4 h-4" /> },
    { id: 'kegiatan', label: 'Jadwal Kegiatan', icon: <Calendar className="w-4 h-4" /> },
    { id: 'pengumuman', label: 'Pengumuman Masjid', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'peminjaman', label: 'Peminjaman Fasilitas', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'layanan', label: 'Layanan Jemaah', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'laporan', label: 'Pusat Ringkasan Data', icon: <FileBarChart className="w-4 h-4" /> },
    { id: 'users', label: 'Kelola Akun', icon: <UserCog className="w-4 h-4" />, adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Menu Samping */}
      <aside className="w-full lg:w-64 bg-emerald-950 text-slate-200 flex flex-col shrink-0 border-r border-emerald-900 print:hidden">
        <div className="p-5 border-b border-emerald-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wide block leading-none">
                SILAMAS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-medium">
                Ruang Pengurus
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Pengguna Aktif */}
        {user && (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-emerald-900/60 border border-emerald-800/80">
            <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              {user.role === 'admin' ? 'Administrator Utama' : 'Pengurus Masjid'}
            </span>
            <p className="font-semibold text-sm text-white truncate">{user.nama}</p>
            <p className="text-xs text-emerald-300/70 truncate">@{user.username}</p>
          </div>
        )}

        {/* Daftar Menu Navigasi */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-500 text-emerald-950 shadow-sm font-bold'
                    : 'text-emerald-100/80 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tombol Aksi Bawah */}
        <div className="p-3 border-t border-emerald-900/80 space-y-1.5">
          {user?.role === 'admin' && (
            <button
              onClick={onResetDb}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:bg-emerald-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Ulang Data Awal</span>
            </button>
          )}
          <button
            onClick={onExitToPublic}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-200 hover:bg-emerald-900 transition-colors"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Lihat Halaman Utama</span>
          </button>
          <button
            onClick={() => {
              logout();
              onExitToPublic();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {visibleItems.find((i) => i.id === activeModule)?.label}
            </h1>
            <p className="text-xs text-slate-500">
              Sistem Informasi Manajemen Layanan & Administrasi Masjid (SILAMAS)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-medium">
              Cakupan Akses:{' '}
              <strong>
                {user?.role === 'admin'
                  ? 'Seluruh Masjid Terdaftar'
                  : user?.nama_masjid || `Masjid (${user?.id_masjid})`}
              </strong>
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
