import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RefreshCw,
  Calendar,
  User,
  Layers,
  RotateCcw,
} from 'lucide-react';

export default function SoundingFormPage({
  tanks,
  editRecord,
  onSave,
  onCancelEdit,
  showToast,
  isOnline,
}) {
  const activeTanks = tanks.filter((t) => t.is_active);

  const [date, setDate] = useState(
    editRecord?.calculation_date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    editRecord?.calculation_time ||
      new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [shift, setShift] = useState(editRecord?.shift || 1);
  const [recordedBy, setRecordedBy] = useState(editRecord?.recorded_by || '');
  const [notes, setNotes] = useState(editRecord?.notes || '');

  // State sounding per tangki: { [tankId]: { sounding_cm: '', notes: '' } }
  const [tankInputs, setTankInputs] = useState(() => {
    const initial = {};
    if (editRecord && editRecord.items) {
      editRecord.items.forEach((item) => {
        const matched = activeTanks.find(
          (t) =>
            t.id === (item.tank_id || item.tank) ||
            (item.tank_code && t.code && t.code.toUpperCase() === item.tank_code.toUpperCase())
        );
        const key = matched ? matched.id : (item.tank_id || item.tank);
        initial[key] = {
          sounding_cm: item.sounding_cm || '',
          notes: item.notes || '',
        };
      });
    } else {
      activeTanks.forEach((tank) => {
        initial[tank.id] = {
          sounding_cm: '',
          notes: '',
        };
      });
    }
    return initial;
  });

  // Sinkronisasi jika editRecord berubah
  useEffect(() => {
    if (editRecord) {
      setDate(editRecord.calculation_date);
      setTime(editRecord.calculation_time || '06:00');
      setShift(editRecord.shift || 1);
      setRecordedBy(editRecord.recorded_by || '');
      setNotes(editRecord.notes || '');

      const loaded = {};
      (editRecord.items || []).forEach((item) => {
        const matched = activeTanks.find(
          (t) =>
            t.id === (item.tank_id || item.tank) ||
            (item.tank_code && t.code && t.code.toUpperCase() === item.tank_code.toUpperCase())
        );
        const key = matched ? matched.id : (item.tank_id || item.tank);
        loaded[key] = {
          sounding_cm: item.sounding_cm,
          notes: item.notes || '',
        };
      });
      setTankInputs(loaded);
    }
  }, [editRecord]);

  const handleInputChange = (tankId, field, val) => {
    setTankInputs((prev) => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        [field]: val,
      },
    }));
  };

  // Kalkulasi Live Real-time
  let grandTotalCm = 0;
  let grandTotalLiters = 0;

  const calculatedRows = activeTanks.map((tank) => {
    const rawCm = tankInputs[tank.id]?.sounding_cm;
    const cm = parseFloat(rawCm) || 0;
    const factor = parseFloat(tank.liter_per_cm) || 0;
    const vol = Math.round(cm * factor * 100) / 100;

    grandTotalCm += cm;
    grandTotalLiters += vol;

    return {
      tank,
      cm,
      factor,
      vol,
      notes: tankInputs[tank.id]?.notes || '',
    };
  });

  const handleSubmit = (e, autoSync = false) => {
    e?.preventDefault();

    if (!date) {
      showToast('Tanggal pengukuran harus diisi', 'error');
      return;
    }
    if (!recordedBy.trim()) {
      showToast('Nama petugas checker harus diisi', 'error');
      return;
    }

    const items = calculatedRows.map((row) => {
      let tid = row.tank.id;
      if (typeof tid !== 'number' && row.tank.server_id && typeof row.tank.server_id === 'number') {
        tid = row.tank.server_id;
      }

      return {
        tank_id: tid,
        tank_code: row.tank.code,
        sounding_cm: row.cm,
        liter_per_cm: row.factor,
        volume_liters: row.vol,
        notes: row.notes,
      };
    });

    const payload = {
      ...(editRecord ? { id: editRecord.id, server_id: editRecord.server_id } : {}),
      calculation_date: date,
      calculation_time: time,
      shift: parseInt(shift, 10),
      recorded_by: recordedBy.trim(),
      notes: notes.trim(),
      items,
      total_sounding_cm: grandTotalCm,
      total_liters: grandTotalLiters,
    };

    onSave(payload, autoSync);
    if (!editRecord) {
      // Reset form sounding cm
      const resetInputs = {};
      activeTanks.forEach((tank) => {
        resetInputs[tank.id] = { sounding_cm: '', notes: '' };
      });
      setTankInputs(resetInputs);
      setNotes('');
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              {editRecord ? 'Edit Riwayat Kalkulasi Sounding' : 'Input Sounding Tangki Jetty'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Input tinggi sounding (cm) per tangki. Sistem menghitung volume otomatis berdasarkan faktor tera masing-masing tangki.
          </p>
        </div>

        {editRecord && (
          <button
            onClick={onCancelEdit}
            className="self-start sm:self-auto text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Batal Edit</span>
          </button>
        )}
      </div>

      {/* FORM INPUT SESI */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>Informasi Pengukuran & Petugas</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Sounding
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
              required
            />
          </div>

          {/* Jam */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Waktu (Jam:Menit)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shift Kerja
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setShift(1)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  shift === 1
                    ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Shift 1
              </button>
              <button
                type="button"
                onClick={() => setShift(2)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  shift === 2
                    ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Shift 2
              </button>
            </div>
          </div>

          {/* Checker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petugas / Checker
            </label>
            <div className="relative">
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="Nama petugas checker"
                className="w-full text-sm px-3 py-2 pl-8 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Catatan Sesi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Operasional (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan kondisi operasional lapangan..."
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* LIVE ACCUMULATION SUMMARY CARD */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-xl p-4 sm:p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Live Kalkulasi Akumulasi</span>
            </div>
            <div className="text-xs text-white/90">
              Perhitungan otomatis dari {calculatedRows.length} tangki aktif di Jetty
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Box 1: Total Sounding cm */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg px-3.5 py-2 text-right">
              <div className="text-xs text-white/80 font-medium uppercase tracking-wider">
                Total Sounding
              </div>
              <div className="text-base sm:text-lg font-bold font-mono">
                {grandTotalCm.toLocaleString('id-ID', { maximumFractionDigits: 1 })} cm
              </div>
            </div>

            {/* Box 2: Total Akumulasi Liter */}
            <div className="bg-white rounded-lg px-4 py-2 text-right shadow-xs border border-emerald-200">
              <div className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                Akumulasi Total Liter
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-700 font-mono">
                {grandTotalLiters.toLocaleString('id-ID')} Liter
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL / KARTU INPUT TANGKI */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Pengukuran Sounding Tiap Tangki</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Faktor tera terpasang dari master
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Tangki</th>
                <th className="py-3 px-3">Faktor Nilai Tera</th>
                <th className="py-3 px-3 w-44">Tinggi Sounding (cm)</th>
                <th className="py-3 px-3">Hasil Kalkulasi Volume</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculatedRows.map((row) => (
                <tr key={row.tank.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-xs">
                        {row.tank.code}
                      </span>
                      <span className="font-medium text-slate-800 text-xs">
                        {row.tank.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded text-xs border border-sky-100">
                      1 cm = {row.factor} L
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0"
                        value={tankInputs[row.tank.id]?.sounding_cm ?? ''}
                        onChange={(e) =>
                          handleInputChange(row.tank.id, 'sounding_cm', e.target.value)
                        }
                        className="w-full font-mono text-sm font-semibold px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                      />
                      <span className="absolute right-2.5 top-2 text-xs font-medium text-slate-400">
                        cm
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50/60 px-2.5 py-1 rounded border border-emerald-100 inline-block">
                      {row.vol.toLocaleString('id-ID')} L
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="Ket. kondisi..."
                      value={tankInputs[row.tank.id]?.notes ?? ''}
                      onChange={(e) =>
                        handleInputChange(row.tank.id, 'notes', e.target.value)
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-sky-500 bg-slate-50/40"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
          {calculatedRows.map((row) => (
            <div
              key={row.tank.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                    {row.tank.code}
                  </span>
                  <div className="font-medium text-xs text-slate-800 mt-1">
                    {row.tank.name}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-sky-700 bg-white px-2 py-1 rounded border border-sky-200">
                    1 cm = {row.factor} L
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tinggi Sounding
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={tankInputs[row.tank.id]?.sounding_cm ?? ''}
                      onChange={(e) =>
                        handleInputChange(row.tank.id, 'sounding_cm', e.target.value)
                      }
                      className="w-full font-mono text-sm font-semibold px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                    <span className="absolute right-2 top-2 text-xs font-medium text-slate-400">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Hasil Volume
                  </label>
                  <div className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-right">
                    {row.vol.toLocaleString('id-ID')} L
                  </div>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Catatan tangki..."
                  value={tankInputs[row.tank.id]?.notes ?? ''}
                  onChange={(e) =>
                    handleInputChange(row.tank.id, 'notes', e.target.value)
                  }
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pb-6">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Offline di Browser</span>
        </button>

        {isOnline && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Simpan & Langsung Sync ke Server</span>
          </button>
        )}
      </div>
    </div>
  );
}
