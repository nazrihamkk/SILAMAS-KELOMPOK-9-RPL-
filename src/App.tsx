/**
 * KELOMPOK 9
 * Nadya Syahara Salihin — F5512510002
 * Nazril Ilham Kakame — F5512510026
 * Giri Ariska Putri — F5512510035
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { NotificationToast, ToastMessage } from './components/NotificationToast.js';

// Halaman publik
import { HomePage } from './pages/public/HomePage.js';
import { MasjidDirectoryPage } from './pages/public/MasjidDirectoryPage.js';
import { MasjidDetailPage } from './pages/public/MasjidDetailPage.js';
import { PeminjamanPage } from './pages/public/PeminjamanPage.js';
import { LayananPage } from './pages/public/LayananPage.js';
import { TrackingPage } from './pages/public/TrackingPage.js';
import { LoginPage } from './pages/public/LoginPage.js';

// Halaman administrasi & pengurus
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminMasjidPage } from './pages/admin/AdminMasjidPage.js';
import { AdminFasilitasPage } from './pages/admin/AdminFasilitasPage.js';
import { AdminPengurusPage } from './pages/admin/AdminPengurusPage.js';
import { AdminKegiatanPage } from './pages/admin/AdminKegiatanPage.js';
import { AdminPengumumanPage } from './pages/admin/AdminPengumumanPage.js';
import { AdminPeminjamanPage } from './pages/admin/AdminPeminjamanPage.js';
import { AdminLayananPage } from './pages/admin/AdminLayananPage.js';
import { AdminLaporanPage } from './pages/admin/AdminLaporanPage.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { api } from './services/api.js';

function MainApp() {
  const { user } = useAuth();

  // Status navigasi halaman aktif
  const [currentView, setCurrentView] = useState<'home' | 'direktori' | 'detail' | 'peminjaman' | 'layanan' | 'tracking' | 'login' | 'admin'>('home');
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>('MSJ-001');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [adminModule, setAdminModule] = useState<string>('dashboard');

  // Daftar pesan notifikasi
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetDatabase = async () => {
    try {
      await api.resetDatabase();
      addToast('Basis data SILAMAS berhasil dikembalikan ke data awal masjid terdaftar.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      addToast(err.message || 'Gagal mereset basis data.', 'error');
    }
  };

  // Tampilkan tata letak Ruang Pengurus apabila berada pada mode administrasi
  if (currentView === 'admin') {
    if (!user) {
      setCurrentView('login');
      return null;
    }

    return (
      <>
        <NotificationToast toasts={toasts} onDismiss={removeToast} />
        <AdminLayout
          activeModule={adminModule}
          setActiveModule={setAdminModule}
          onExitToPublic={() => setCurrentView('home')}
          onResetDb={handleResetDatabase}
        >
          {adminModule === 'dashboard' && <AdminDashboardPage onNavigateModule={setAdminModule} />}
          {adminModule === 'masjid' && <AdminMasjidPage />}
          {adminModule === 'fasilitas' && <AdminFasilitasPage />}
          {adminModule === 'pengurus' && <AdminPengurusPage />}
          {adminModule === 'kegiatan' && <AdminKegiatanPage />}
          {adminModule === 'pengumuman' && <AdminPengumumanPage />}
          {adminModule === 'peminjaman' && <AdminPeminjamanPage />}
          {adminModule === 'layanan' && <AdminLayananPage />}
          {adminModule === 'laporan' && <AdminLaporanPage />}
          {adminModule === 'users' && <AdminUsersPage />}
        </AdminLayout>
      </>
    );
  }

  // Tampilan utama untuk pengunjung publik
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <NotificationToast toasts={toasts} onDismiss={removeToast} />

      {/* Navigasi Atas */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'admin' && !user) {
            setCurrentView('login');
          } else {
            setCurrentView(view as any);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Konten Halaman Publik */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigateMasjid={(id) => {
              setSelectedMasjidId(id);
              setCurrentView('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigatePeminjaman={(id) => {
              if (id) setSelectedMasjidId(id);
              setCurrentView('peminjaman');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateLayanan={(id) => {
              if (id) setSelectedMasjidId(id);
              setCurrentView('layanan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateTracking={(code) => {
              if (code) setTrackingCode(code);
              setCurrentView('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateDirektori={() => {
              setCurrentView('direktori');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'direktori' && (
          <MasjidDirectoryPage
            onSelectMasjid={(id) => {
              setSelectedMasjidId(id);
              setCurrentView('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPinjamMasjid={(id) => {
              setSelectedMasjidId(id);
              setCurrentView('peminjaman');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'detail' && (
          <MasjidDetailPage
            masjidId={selectedMasjidId}
            onBack={() => setCurrentView('direktori')}
            onNavigatePeminjaman={(id) => {
              setSelectedMasjidId(id);
              setCurrentView('peminjaman');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateLayanan={(id) => {
              setSelectedMasjidId(id);
              setCurrentView('layanan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'peminjaman' && (
          <PeminjamanPage
            initialMasjidId={selectedMasjidId}
            onNavigateTracking={(code) => {
              setTrackingCode(code);
              setCurrentView('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'layanan' && (
          <LayananPage
            initialMasjidId={selectedMasjidId}
            onNavigateTracking={(code) => {
              setTrackingCode(code);
              setCurrentView('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'tracking' && (
          <TrackingPage initialCode={trackingCode} />
        )}

        {currentView === 'login' && (
          <LoginPage
            onSuccess={() => {
              addToast('Berhasil masuk! Selamat datang di Ruang Pengurus SILAMAS.', 'success');
              setCurrentView('admin');
            }}
            onBack={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Kaki Halaman */}
      <Footer
        setCurrentView={(view) => {
          setCurrentView(view as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
