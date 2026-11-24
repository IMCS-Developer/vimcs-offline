/**
 * VIMCS Offline Storage Service
 * Mengelola penyimpanan lokal di browser dengan persistensi LocalStorage.
 * Menyediakan data master tangki awal (seperti 1 cm = 66 L dan 1 cm = 67 L)
 * dan mendukung sinkronisasi dua arah dengan server Django.
 */

const STORAGE_KEYS = {
  TANKS: 'vimcs_jetty_tanks',
  CALCULATIONS: 'vimcs_jetty_calculations',
  SETTINGS: 'vimcs_settings',
};

const DEFAULT_TANKS = [
  {
    id: 1,
    code: 'TK-JETTY-01',
    name: 'Tangki 1 (Jetty)',
    liter_per_cm: 66.0,
    capacity_liters: 250000,
    is_active: true,
    display_order: 1,
    notes: '',
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: 'TK-JETTY-02',
    name: 'Tangki 2 (Jetty)',
    liter_per_cm: 67.0,
    capacity_liters: 250000,
    is_active: true,
    display_order: 2,
    notes: '',
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS = {
  api_base_url: 'http://127.0.0.1:8000',
  auto_sync: true,
  inspector_name: '',
};

export const storageService = {
  // ==========================================
  // MASTER TANGKI (CRUD OFFLINE)
  // ==========================================
  getTanks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TANKS);
      if (!data) {
        this.saveTanks(DEFAULT_TANKS);
        return DEFAULT_TANKS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveTanks(DEFAULT_TANKS);
        return DEFAULT_TANKS;
      }
      return parsed.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } catch (e) {
      console.error('Error reading tanks from localStorage:', e);
      return DEFAULT_TANKS;
    }
  },

  getActiveTanks() {
    return this.getTanks().filter((t) => t.is_active);
  },

  saveTanks(tanks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TANKS, JSON.stringify(tanks));
      window.dispatchEvent(new Event('vimcs:tanks-changed'));
    } catch (e) {
      console.error('Error saving tanks to localStorage:', e);
    }
  },

  saveTank(tank) {
    const tanks = this.getTanks();
    const cleanTank = {
      ...tank,
      liter_per_cm: parseFloat(tank.liter_per_cm) || 0,
      capacity_liters: parseFloat(tank.capacity_liters) || 0,
      display_order: parseInt(tank.display_order, 10) || 0,
      is_active: Boolean(tank.is_active),
      updated_at: new Date().toISOString(),
    };

    if (cleanTank.id) {
      // Update existing
      const index = tanks.findIndex((t) => t.id === cleanTank.id);
      if (index !== -1) {
        tanks[index] = { ...tanks[index], ...cleanTank };
      } else {
        tanks.push(cleanTank);
      }
    } else {
      // Create new
      cleanTank.id = 'tk_' + Date.now();
      tanks.push(cleanTank);
    }

    this.saveTanks(tanks);
    return cleanTank;
  },

  deleteTank(id) {
    const tanks = this.getTanks().filter((t) => t.id !== id);
    this.saveTanks(tanks);
  },

  // ==========================================
  // KALKULASI & RIWAYAT SOUNDING (CRUD OFFLINE)
  // ==========================================
  getCalculations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALCULATIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed)
        ? parsed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
    } catch (e) {
      console.error('Error reading calculations from localStorage:', e);
      return [];
    }
  },

  getCalculationById(id) {
    return this.getCalculations().find((c) => c.id === id);
  },

  saveCalculation(data) {
    const calculations = this.getCalculations();
    const now = new Date();

    // Hitung ulang per item dan total akumulasi
    let totalCm = 0;
    let totalLiters = 0;
    const summaries = [];

    const calculatedItems = (data.items || []).map((item) => {
      const cm = parseFloat(item.sounding_cm) || 0;
      const factor = parseFloat(item.liter_per_cm) || 0;
      const vol = Math.round(cm * factor * 100) / 100;

      totalCm += cm;
      totalLiters += vol;

      const tankCode = item.tank_code || `TK-${item.tank_id || 'X'}`;
      const volFormatted = vol.toLocaleString('id-ID', { maximumFractionDigits: 0 });
      const cmFormatted = cm.toLocaleString('id-ID', { maximumFractionDigits: 1 });
      summaries.push(`${tankCode}: ${cmFormatted} cm (${volFormatted} L)`);

      return {
        ...item,
        sounding_cm: cm,
        liter_per_cm: factor,
        volume_liters: vol,
      };
    });

    const isUpdate = Boolean(data.id);
    const id = data.id || 'off_' + Date.now();

    const record = {
      id,
      calculation_date: data.calculation_date || now.toISOString().split('T')[0],
      calculation_time:
        data.calculation_time ||
        now.toTimeString().split(' ')[0].substring(0, 5),
      shift: parseInt(data.shift, 10) || 1,
      recorded_by: data.recorded_by || 'Operator',
      notes: data.notes || '',
      items: calculatedItems,
      total_sounding_cm: Math.round(totalCm * 100) / 100,
      total_liters: Math.round(totalLiters * 100) / 100,
      sounding_summary: summaries.join(' | '),
      sync_status: isUpdate && data.sync_status === 'synced' ? 'pending_sync' : (data.sync_status || 'pending_sync'),
      server_id: data.server_id || null,
      created_at: data.created_at || now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (isUpdate) {
      const index = calculations.findIndex((c) => c.id === id);
      if (index !== -1) {
        calculations[index] = record;
      } else {
        calculations.unshift(record);
      }
    } else {
      calculations.unshift(record);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(calculations));
      window.dispatchEvent(new Event('vimcs:calculations-changed'));
    } catch (e) {
      console.error('Error saving calculation to localStorage:', e);
    }

    return record;
  },

  deleteCalculation(id) {
    const calculations = this.getCalculations().filter((c) => c.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(calculations));
      window.dispatchEvent(new Event('vimcs:calculations-changed'));
    } catch (e) {
      console.error('Error deleting calculation:', e);
    }
  },

  markAsSynced(syncedResults) {
    if (!Array.isArray(syncedResults) || syncedResults.length === 0) return;
    const calculations = this.getCalculations();

    const mapping = {};
    syncedResults.forEach((res) => {
      if (res.offline_id) {
        mapping[res.offline_id] = res;
      }
    });

    const updated = calculations.map((calc) => {
      const match = mapping[calc.id];
      if (match) {
        return {
          ...calc,
          sync_status: 'synced',
          server_id: match.server_id,
          synced_at: new Date().toISOString(),
        };
      }
      return calc;
    });

    try {
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(updated));
      window.dispatchEvent(new Event('vimcs:calculations-changed'));
    } catch (e) {
      console.error('Error updating sync status:', e);
    }
  },

  // ==========================================
  // PENGATURAN APLIKASI
  // ==========================================
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      window.dispatchEvent(new Event('vimcs:settings-changed'));
      return updated;
    } catch (e) {
      console.error('Error saving settings:', e);
      return DEFAULT_SETTINGS;
    }
  },

  // Reset database lokal kembali ke default
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.CALCULATIONS);
    localStorage.setItem(STORAGE_KEYS.TANKS, JSON.stringify(DEFAULT_TANKS));
    window.dispatchEvent(new Event('vimcs:tanks-changed'));
    window.dispatchEvent(new Event('vimcs:calculations-changed'));
  },
};
