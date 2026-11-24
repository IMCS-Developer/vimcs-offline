import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

import DashboardPage from './pages/DashboardPage';
import SoundingFormPage from './pages/SoundingFormPage';
import CalculationHistoryPage from './pages/CalculationHistoryPage';
import MasterTankPage from './pages/MasterTankPage';
import SyncSettingsPage from './pages/SyncSettingsPage';

import { storageService } from './services/storageService';
import { apiService } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tanks, setTanks] = useState(() => storageService.getTanks());
  const [calculations, setCalculations] = useState(() => storageService.getCalculations());
  const [settings, setSettings] = useState(() => storageService.getSettings());

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const [editRecord, setEditRecord] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Refresh local data from storage
  const reloadData = useCallback(() => {
    setTanks(storageService.getTanks());
    setCalculations(storageService.getCalculations());
    setSettings(storageService.getSettings());
  }, []);

  // Cek konektivitas ke Django server
  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setIsServerReachable(false);
      return false;
    }
    const reachable = await apiService.checkHealth();
    setIsServerReachable(reachable);
    return reachable;
  }, []);

  // Sinkronisasi data ke server
  const handleSyncAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await apiService.syncCalculations();
      if (res.success) {
        showToast(res.message, res.synced_count > 0 ? 'success' : 'info');
        reloadData();
      } else {
        showToast(res.message || 'Gagal menyinkronkan data ke server', 'error');
      }
    } catch (e) {
      showToast('Koneksi gagal atau server tidak merespon', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [reloadData, showToast]);

  // Tarik master tangki terbaru dari server
  const handlePullMaster = useCallback(async () => {
    setIsPulling(true);
    try {
      const res = await apiService.pullMasterTanks();
      if (res.success) {
        showToast(`Berhasil memperbarui ${res.count} master tangki dari server`, 'success');
        reloadData();
      } else {
        showToast(res.message || 'Gagal menarik master tangki dari server', 'error');
      }
    } catch (e) {
      showToast('Gagal menarik master tangki dari server', 'error');
    } finally {
      setIsPulling(false);
    }
  }, [reloadData, showToast]);

  // Efek inisialisasi & listener status jaringan
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    window.addEventListener('vimcs:tanks-changed', reloadData);
    window.addEventListener('vimcs:calculations-changed', reloadData);
    window.addEventListener('vimcs:settings-changed', reloadData);

    // Initial check
    checkConnection().then((reachable) => {
      if (reachable && settings.auto_sync) {
        handleSyncAll();
      }
    });

    // Interval ping berkala tiap 20 detik
    const interval = setInterval(checkConnection, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('vimcs:tanks-changed', reloadData);
      window.removeEventListener('vimcs:calculations-changed', reloadData);
      window.removeEventListener('vimcs:settings-changed', reloadData);
      clearInterval(interval);
    };
  }, [checkConnection, handleSyncAll, reloadData, settings.auto_sync]);

  // Handlers
  const handleSaveCalculation = (data, autoSyncDirect = false) => {
    const saved = storageService.saveCalculation(data);
    showToast(
      editRecord ? 'Riwayat kalkulasi berhasil diperbarui' : 'Kalkulasi sounding berhasil disimpan di browser',
      'success'
    );
    setEditRecord(null);
    reloadData();

    if (autoSyncDirect && isOnline && isServerReachable) {
      handleSyncAll();
    } else {
      setActiveTab('history');
    }
    return saved;
  };

  const handleEditCalculation = (calc) => {
    setEditRecord(calc);
    setActiveTab('sounding-new');
  };

  const handleDeleteCalculation = (id) => {
    storageService.deleteCalculation(id);
    showToast('Rekaman kalkulasi berhasil dihapus', 'info');
    reloadData();
  };

  const handleSaveTank = async (tankData) => {
    const saved = storageService.saveTank(tankData);
    showToast(`Master tangki ${saved.code} berhasil disimpan`, 'success');
    reloadData();

    // Push jika online
    if (isOnline && isServerReachable) {
      apiService.pushTankToServer(saved);
    }
  };

  const handleDeleteTank = (id) => {
    storageService.deleteTank(id);
    showToast('Master tangki berhasil dihapus', 'info');
    reloadData();
  };

  const handleResetAll = () => {
    storageService.resetAll();
    showToast('Penyimpanan lokal berhasil direset ke setelan awal', 'info');
    reloadData();
  };

  const pendingCount = calculations.filter((c) => c.sync_status === 'pending_sync').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <Header
        isOnline={isOnline}
        isServerReachable={isServerReachable}
        pendingCount={pendingCount}
        onSync={handleSyncAll}
        isSyncing={isSyncing}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'sounding-new' && activeTab !== 'sounding-new') {
              setEditRecord(null);
            }
            setActiveTab(tab);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingCount={pendingCount}
          tankCount={tanks.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 pb-24 md:pb-10 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage
              tanks={tanks}
              calculations={calculations}
              pendingCount={pendingCount}
              onNavigate={(tab) => {
                if (tab === 'sounding-new') setEditRecord(null);
                setActiveTab(tab);
              }}
              onSync={handleSyncAll}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'sounding-new' && (
            <SoundingFormPage
              tanks={tanks}
              editRecord={editRecord}
              onSave={handleSaveCalculation}
              onCancelEdit={() => {
                setEditRecord(null);
                setActiveTab('history');
              }}
              showToast={showToast}
              isOnline={isOnline && isServerReachable}
              onSyncDirect={handleSyncAll}
            />
          )}

          {activeTab === 'history' && (
            <CalculationHistoryPage
              calculations={calculations}
              onEdit={handleEditCalculation}
              onDelete={handleDeleteCalculation}
              onSyncAll={handleSyncAll}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'master-tanks' && (
            <MasterTankPage
              tanks={tanks}
              onSaveTank={handleSaveTank}
              onDeleteTank={handleDeleteTank}
              onPullMaster={handlePullMaster}
              isPulling={isPulling}
            />
          )}

          {activeTab === 'sync-settings' && (
            <SyncSettingsPage
              settings={settings}
              onSaveSettings={(s) => {
                storageService.saveSettings(s);
                reloadData();
                checkConnection();
              }}
              isOnline={isOnline}
              isServerReachable={isServerReachable}
              pendingCount={pendingCount}
              onSyncAll={handleSyncAll}
              onPullMaster={handlePullMaster}
              onResetAll={handleResetAll}
              isSyncing={isSyncing}
              calculations={calculations}
              tanks={tanks}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'sounding-new' && activeTab !== 'sounding-new') {
            setEditRecord(null);
          }
          setActiveTab(tab);
        }}
        pendingCount={pendingCount}
      />
    </div>
  );
}
