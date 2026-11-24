import React, { useState } from 'react';
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Save,
} from 'lucide-react';

export default function MasterTankPage({
  tanks,
  onSaveTank,
  onDeleteTank,
  onPullMaster,
  isPulling,
}) {
  const [editingTank, setEditingTank] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [literPerCm, setLiterPerCm] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [notes, setNotes] = useState('');

  const handleOpenModal = (tank = null) => {
    if (tank) {
      setEditingTank(tank);
      setCode(tank.code || '');
      setName(tank.name || '');
      setLiterPerCm(tank.liter_per_cm || '');
      setCapacity(tank.capacity_liters || '');
      setIsActive(tank.is_active ?? true);
      setDisplayOrder(tank.display_order ?? 0);
      setNotes(tank.notes || '');
    } else {
      setEditingTank({});
      setCode('');
      setName('');
      setLiterPerCm('');
      setCapacity('');
      setIsActive(true);
      setDisplayOrder(tanks.length + 1);
      setNotes('');
    }
  };

  const handleCloseModal = () => {
    setEditingTank(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !literPerCm) return;

    const payload = {
      ...(editingTank.id ? { id: editingTank.id, server_id: editingTank.server_id } : {}),
      code: code.trim(),
      name: name.trim(),
      liter_per_cm: parseFloat(literPerCm) || 0,
      capacity_liters: parseFloat(capacity) || 0,
      is_active: Boolean(isActive),
      display_order: parseInt(displayOrder, 10) || 0,
      notes: notes.trim(),
    };

    onSaveTank(payload);
    handleCloseModal();
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto w-full overflow-x-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              Master Tangki Jetty & Faktor Tera
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data master tangki dan nilai kalibrasi tera (misal: 1 cm = 66 L atau 67 L).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPullMaster}
            disabled={isPulling}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Ambil master terbaru dari server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
            <span>{isPulling ? 'Menarik...' : 'Tarik dari Server'}</span>
          </button>

          <button
            onClick={() => handleOpenModal(null)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tangki</span>
          </button>
        </div>
      </div>

      {/* TANK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tanks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada master tangki. Klik "Tambah Tangki" atau "Tarik dari Server".
          </div>
        ) : (
          tanks.map((tank) => (
            <div
              key={tank.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                tank.is_active ? 'border-slate-200' : 'border-slate-200/60 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                      {tank.code}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        tank.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tank.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-800 mt-1 truncate">
                    {tank.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenModal(tank)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                    title="Edit Tangki"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(tank.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Hapus Tangki"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nilai Tera Highlight */}
              <div className="mt-3 p-3 bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-lg border border-sky-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase">
                    Faktor Konversi Tera
                  </div>
                  <div className="font-mono font-bold text-sky-800 text-base">
                    1 cm = {tank.liter_per_cm} Liter
                  </div>
                </div>

                {tank.capacity_liters > 0 && (
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-500 uppercase">
                      Kapasitas
                    </div>
                    <div className="font-mono font-semibold text-slate-700 text-xs">
                      {tank.capacity_liters.toLocaleString('id-ID')} L
                    </div>
                  </div>
                )}
              </div>

              {tank.notes && (
                <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2 rounded break-words">
                  "{tank.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH / EDIT TANGKI */}
      {editingTank && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingTank.id ? 'Edit Master Tangki Jetty' : 'Tambah Tangki Jetty Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Tangki
                </label>
                <input
                  type="text"
                  placeholder="Misal: TK-JETTY-03"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full font-mono text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Tangki
                </label>
                <input
                  type="text"
                  placeholder="Misal: Tangki 3 (Jetty)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Faktor Tera (1 cm = L)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Misal: 66.5"
                    value={literPerCm}
                    onChange={(e) => setLiterPerCm(e.target.value)}
                    className="w-full font-mono text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Liter per centimeter
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas (Liter)
                  </label>
                  <input
                    type="number"
                    placeholder="Misal: 250000"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full font-mono text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                  />
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Kapasitas maks. tangki
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-medium text-slate-700 text-xs">
                      Status Aktif
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Spesifikasi (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Catatan teknis tangki..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Tangki</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900">Hapus Master Tangki</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus tangki ini dari daftar master offline?
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
                  onDeleteTank(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
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
