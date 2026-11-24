import React, { useState } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Layers,
} from 'lucide-react';

export default function CalculationHistoryPage({
  calculations,
  onEdit,
  onDelete,
  onSyncAll,
  isSyncing,
}) {
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [syncFilter, setSyncFilter] = useState('ALL');
  const [selectedCalc, setSelectedCalc] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter logika
  const filtered = calculations.filter((calc) => {
    if (shiftFilter !== 'ALL' && calc.shift.toString() !== shiftFilter) {
      return false;
    }
    if (syncFilter !== 'ALL' && calc.sync_status !== syncFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchChecker = (calc.recorded_by || '').toLowerCase().includes(q);
      const matchNotes = (calc.notes || '').toLowerCase().includes(q);
      const matchSummary = (calc.sounding_summary || '').toLowerCase().includes(q);
      const matchDate = (calc.calculation_date || '').includes(q);
      if (!matchChecker && !matchNotes && !matchSummary && !matchDate) {
        return false;
      }
    }
    return true;
  });

  const pendingList = calculations.filter((c) => c.sync_status === 'pending_sync');

  return (
    <div className="space-y-5 max-w-6xl mx-auto w-full overflow-x-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              Riwayat Kalkulasi & Sounding Tera
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar sesi sounding yang tersimpan di browser ({calculations.length} rekaman).
          </p>
        </div>

        {pendingList.length > 0 && (
          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="self-start sm:self-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync {pendingList.length} Rekaman Offline ke Server</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari tanggal, checker, catatan, atau tangki..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filter Shift */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 font-medium flex-1 md:flex-initial"
          >
            <option value="ALL">Semua Shift</option>
            <option value="1">Shift 1</option>
            <option value="2">Shift 2</option>
          </select>

          {/* Filter Status Sync */}
          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 font-medium flex-1 md:flex-initial"
          >
            <option value="ALL">Semua Status</option>
            <option value="pending_sync">Belum Disinkron (Offline)</option>
            <option value="synced">Tersinkronisasi</option>
          </select>
        </div>
      </div>

      {/* TABLE DATA LIST (DESKTOP) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3">Checker</th>
                <th className="py-3 px-3">Ringkasan Sounding Tangki</th>
                <th className="py-3 px-3 text-right">Total (cm)</th>
                <th className="py-3 px-3 text-right">Akumulasi Liter</th>
                <th className="py-3 px-3 text-center">Status Sync</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada rekaman sounding yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((calc) => (
                  <tr key={calc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 text-xs">
                        {calc.calculation_date}
                      </div>
                      <div className="text-xs text-slate-400">
                        {calc.calculation_time || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                          calc.shift === 1
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        Shift {calc.shift}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-700">
                      {calc.recorded_by || '-'}
                    </td>

                    <td
                      className="py-3 px-3 font-mono text-xs text-slate-600 max-w-xs truncate"
                      title={calc.sounding_summary}
                    >
                      {calc.sounding_summary || '-'}
                    </td>

                    <td className="py-3 px-3 font-mono text-right font-medium text-slate-700">
                      {calc.total_sounding_cm} cm
                    </td>

                    <td className="py-3 px-3 font-mono text-right font-bold text-emerald-600 text-sm">
                      {calc.total_liters.toLocaleString('id-ID')} L
                    </td>

                    <td className="py-3 px-3 text-center">
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
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedCalc(calc)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded"
                          title="Lihat Rincian"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(calc)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                          title="Edit Kalkulasi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(calc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD LIST */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            Tidak ada rekaman sounding yang cocok.
          </div>
        ) : (
          filtered.map((calc) => (
            <div
              key={calc.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
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
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {calc.calculation_time || '-'} • Oleh: {calc.recorded_by || '-'}
                  </div>
                </div>

                <div>
                  {calc.sync_status === 'synced' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sync</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      <span>Offline</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Rincian Ringkasan */}
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-100 break-words">
                {calc.sounding_summary || '-'}
              </div>

              {/* Total akumulasi */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase">
                    Total Sounding
                  </span>
                  <div className="text-xs font-mono font-semibold text-slate-700">
                    {calc.total_sounding_cm} cm
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-emerald-600 font-semibold uppercase">
                    Akumulasi Total
                  </span>
                  <div className="text-base font-mono font-bold text-emerald-600">
                    {calc.total_liters.toLocaleString('id-ID')} Liter
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                <button
                  onClick={() => setSelectedCalc(calc)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </button>
                <button
                  onClick={() => onEdit(calc)}
                  className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(calc.id)}
                  className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedCalc && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    Rincian Sounding Tera Jetty
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: {selectedCalc.id} {selectedCalc.server_id && `(Server: #${selectedCalc.server_id})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCalc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sesi info */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400">Tanggal:</span>{' '}
                <strong className="text-slate-800">{selectedCalc.calculation_date}</strong>
              </div>
              <div>
                <span className="text-slate-400">Waktu:</span>{' '}
                <strong className="text-slate-800">{selectedCalc.calculation_time || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400">Shift:</span>{' '}
                <strong className="text-slate-800">Shift {selectedCalc.shift}</strong>
              </div>
              <div>
                <span className="text-slate-400">Checker:</span>{' '}
                <strong className="text-slate-800">{selectedCalc.recorded_by || '-'}</strong>
              </div>
            </div>

            {/* Items Tangki */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Pengukuran Tangki
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {(selectedCalc.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white gap-2">
                    <div>
                      <span className="font-mono font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded text-xs">
                        {item.tank_code || `Tank #${item.tank_id || item.tank}`}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">
                        Sounding: <strong className="font-mono text-slate-800">{item.sounding_cm} cm</strong>{' '}
                        (1 cm = {item.liter_per_cm} L)
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-emerald-600 text-sm">
                        {(item.volume_liters || 0).toLocaleString('id-ID')} L
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-400">{item.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-medium uppercase">
                  Total Sounding
                </span>
                <div className="font-mono font-semibold text-slate-800 text-sm">
                  {selectedCalc.total_sounding_cm} cm
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-800 font-semibold uppercase">
                  Total Akumulasi Volume
                </span>
                <div className="font-mono font-bold text-emerald-700 text-lg">
                  {selectedCalc.total_liters.toLocaleString('id-ID')} Liter
                </div>
              </div>
            </div>

            {selectedCalc.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 break-words">
                <span className="font-semibold">Catatan:</span> {selectedCalc.notes}
              </div>
            )}

            <button
              onClick={() => setSelectedCalc(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900">Konfirmasi Hapus</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus rekaman riwayat kalkulasi ini dari penyimpanan browser?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
