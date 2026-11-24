import React from 'react';
import { Wifi, WifiOff, RefreshCw, Menu, Layers } from 'lucide-react';

export default function Header({
  isOnline,
  isServerReachable,
  pendingCount,
  onSync,
  isSyncing,
  onToggleSidebar,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                  VIMCS <span className="text-sky-600">OFFLINE</span>
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                  Jetty
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sounding & Tera Tangki Lapangan
              </p>
            </div>
          </div>
        </div>

        {/* Right: Status & Sync Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline && isServerReachable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={
              isOnline && isServerReachable
                ? 'Terhubung ke server Django'
                : 'Mode Offline (Bekerja secara lokal di browser)'
            }
          >
            {isOnline && isServerReachable ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline Mode</span>
              </>
            )}
          </div>

          {/* Pending Sync Badge & Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              pendingCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            } disabled:opacity-50`}
            title={
              pendingCount > 0
                ? `${pendingCount} rekaman belum disinkron ke server`
                : 'Sinkronisasi dengan server'
            }
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isSyncing ? 'Menyinkronkan...' : pendingCount > 0 ? `Sync (${pendingCount})` : 'Sync'}
            </span>
            {pendingCount > 0 && (
              <span className="sm:hidden bg-white text-amber-600 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
