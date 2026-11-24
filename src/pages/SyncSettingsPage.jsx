import React, { useState } from 'react';
import {
  Settings,
  RefreshCw,
  Server,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
} from 'lucide-react';

export default function SyncSettingsPage({
  settings,
  onSaveSettings,
  isOnline,
  isServerReachable,
  pendingCount,
  onSyncAll,
  onPullMaster,
  onResetAll,
  isSyncing,
  calculations,
  tanks,
  showToast,
}) {
  const [baseUrl, setBaseUrl] = useState(settings.api_base_url || 'http://127.0.0.1:8000');
  const [autoSync, setAutoSync] = useState(settings.auto_sync ?? true);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      api_base_url: baseUrl.trim().replace(/\/+$/, ''),
      auto_sync: autoSync,
    });
    showToast('Pengaturan sinkronisasi berhasil disimpan', 'success');
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'vimcs-offline',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      tanks,
      calculations,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vimcs_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File backup offline berhasil diunduh', 'success');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Header bar */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            Pusat Sinkronisasi & Pengaturan
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Kelola koneksi server Django API, antrean sinkronisasi offline, dan pencadangan data.
        </p>
      </div>

      {/* STATUS KONEKSI CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-sky-600" />
          <span>Status Koneksi Server</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isOnline && isServerReachable
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {isOnline && isServerReachable ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                {isOnline && isServerReachable
                  ? 'Terhubung ke Backend Django'
                  : 'Mode Offline (Lokal)'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isOnline && isServerReachable
                  ? 'Siap melakukan sinkronisasi otomatis'
                  : 'Data akan disimpan aman di browser'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                {pendingCount} Data Menunggu Sync
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {calculations.length - pendingCount} data sudah tersinkronisasi
              </div>
            </div>
          </div>
        </div>

        {/* Action Sync Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Kirim Antrean Kalkulasi ke Server ({pendingCount})</span>
          </button>

          <button
            onClick={onPullMaster}
            disabled={isSyncing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tarik Master Tangki Terbaru</span>
          </button>
        </div>
      </div>

      {/* FORM PENGATURAN API */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-sky-600" />
          <span>Konfigurasi Endpoint API</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Base URL Django Backend
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full text-sm font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              required
            />
            <span className="text-xs text-slate-400 mt-1 block">
              Contoh: http://127.0.0.1:8000 atau https://fms-api.example.com
            </span>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Otomatis Coba Sync Saat Koneksi Tersedia
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      </div>

      {/* BACKUP & DANGER ZONE */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-sky-600" />
          <span>Cadangan & Pemeliharaan Data Browser</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-800">
              Cadangkan Data ke File JSON
            </div>
            <div className="text-xs text-slate-500">
              Unduh salinan riwayat kalkulasi dan master tangki untuk arsip cadangan
            </div>
          </div>
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Ekspor JSON</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-rose-50/60 rounded-lg border border-rose-100">
          <div>
            <div className="text-xs font-semibold text-rose-800">
              Reset Penyimpanan Lokal Browser
            </div>
            <div className="text-xs text-rose-600/80">
              Menghapus seluruh riwayat sounding lokal dan mengembalikan master ke kondisi awal
            </div>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white rounded"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetAll();
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
