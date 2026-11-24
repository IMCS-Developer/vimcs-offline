import React from 'react';
import {
  Layers,
  Calculator,
  RefreshCw,
  Clock,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage({
  tanks,
  calculations,
  pendingCount,
  onNavigate,
  onSync,
  isSyncing,
}) {
  const activeTanks = tanks.filter((t) => t.is_active);
  const latestCalc = calculations.length > 0 ? calculations[0] : null;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 rounded-xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/30 text-sky-200 text-xs font-medium mb-3 border border-sky-400/20">
            <span>Mode Lapangan Offline-First</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1.5">
            Kalkulasi & Nilai Tera Tangki Jetty
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Catat hasil sounding cm tiap tangki di Jetty tanpa memerlukan koneksi internet.
            Sistem menghitung volume berdasarkan faktor tera per tangki dan mengakumulasikan total volume.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('sounding-new')}
              className="px-4 py-2 bg-white text-sky-800 hover:bg-sky-50 font-semibold rounded-lg text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Input Sounding Baru</span>
            </button>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-sky-600/40 hover:bg-sky-600/60 border border-sky-400/30 text-white font-semibold rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync ke Server'}</span>
            </button>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute right-0 -bottom-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tangki Aktif */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tangki Jetty Aktif</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{activeTanks.length}</div>
          <div className="mt-1 text-xs text-slate-400">
            {tanks.length} total terdaftar
          </div>
        </div>

        {/* Card 2: Riwayat Tersimpan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Riwayat Sounding</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{calculations.length}</div>
          <div className="mt-1 text-xs text-slate-400">
            Tersimpan di browser
          </div>
        </div>

        {/* Card 3: Pending Sync */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Belum Disinkron</span>
            <div
              className={`p-2 rounded-lg ${
                pendingCount > 0
                  ? 'bg-amber-100 text-amber-700 animate-pulse'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              pendingCount > 0 ? 'text-amber-600' : 'text-slate-800'
            }`}
          >
            {pendingCount}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {pendingCount > 0 ? 'Menunggu koneksi' : 'Semua tersinkron'}
          </div>
        </div>

        {/* Card 4: Sounding Terakhir */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Akumulasi Terakhir</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 truncate font-mono">
            {latestCalc
              ? `${latestCalc.total_liters.toLocaleString('id-ID')} L`
              : '-'}
          </div>
          <div className="mt-1 text-xs text-slate-400 truncate">
            {latestCalc
              ? `${latestCalc.calculation_date} (Shift ${latestCalc.shift})`
              : 'Belum ada data'}
          </div>
        </div>
      </div>

      {/* Grid: Master Tangki & Latest Soundings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom 1: Daftar Master Tangki & Faktor Tera */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Master Faktor Tera Tangki</span>
            </h2>
            <button
              onClick={() => onNavigate('master-tanks')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tanks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Tidak ada data master tangki.
              </div>
            ) : (
              tanks.map((tank) => (
                <div
                  key={tank.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded">
                        {tank.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {tank.name}
                      </span>
                    </div>
                    {tank.capacity_liters > 0 && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Kapasitas: {tank.capacity_liters.toLocaleString('id-ID')} L
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200/60 font-mono">
                      1 cm = {tank.liter_per_cm} L
                    </div>
                    <span
                      className={`inline-block text-xs font-medium mt-1 ${
                        tank.is_active ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {tank.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2 & 3: Riwayat Sounding Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Sounding Terbaru</span>
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua ({calculations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {calculations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              Belum ada riwayat sounding yang dicatat. Klik "Input Sounding Baru" untuk memulai pencatatan.
            </div>
          ) : (
            <div className="space-y-3">
              {calculations.slice(0, 4).map((calc) => (
                <div
                  key={calc.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-slate-800">
                          {calc.calculation_date}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            calc.shift === 1
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          Shift {calc.shift}
                        </span>
                        {calc.recorded_by && (
                          <span className="text-xs text-slate-500 font-medium">
                            Oleh: {calc.recorded_by}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-600 font-mono break-words">
                        {calc.sounding_summary || '-'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-bold text-emerald-600 font-mono">
                        {calc.total_liters.toLocaleString('id-ID')} L
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Total {calc.total_sounding_cm} cm
                      </div>

                      <div className="mt-1">
                        {calc.sync_status === 'synced' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tersinkron</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Offline</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
