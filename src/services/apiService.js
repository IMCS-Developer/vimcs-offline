/**
 * VIMCS Offline API Service
 * Menangani komunikasi dan sinkronisasi data dengan backend Django API.
 */

import { storageService } from './storageService';

export const apiService = {
  getBaseUrl() {
    return storageService.getSettings().api_base_url || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  },

  /**
   * Cek koneksi ke server backend
   */
  async checkHealth() {
    const baseUrl = this.getBaseUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${baseUrl}/api/jetty-tanks/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Tarik daftar master tangki terbaru dari server
   */
  async pullMasterTanks() {
    const baseUrl = this.getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/api/jetty-tanks/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        storageService.saveTanks(data);
        return { success: true, count: data.length, data };
      }
      return { success: false, message: 'Tidak ada data master di server' };
    } catch (e) {
      return { success: false, message: e.message || 'Gagal terhubung ke server' };
    }
  },

  /**
   * Kirim antrean kalkulasi offline ke server melalui endpoint bulk-sync
   */
  async syncCalculations() {
    const baseUrl = this.getBaseUrl();
    const allCalcs = storageService.getCalculations();
    const pendingCalcs = allCalcs.filter((c) => c.sync_status === 'pending_sync');

    if (pendingCalcs.length === 0) {
      return { success: true, message: 'Semua data kalkulasi sudah tersinkronisasi.', synced_count: 0 };
    }

    try {
      const allTanks = storageService.getTanks();

      const payload = {
        records: pendingCalcs.map((calc) => {
          let serverId = calc.server_id;
          if (typeof serverId === 'string' && /^\d+$/.test(serverId.trim())) {
            serverId = parseInt(serverId.trim(), 10);
          } else if (typeof serverId !== 'number') {
            serverId = null;
          }

          return {
            offline_id: calc.id,
            server_id: serverId,
            calculation_date: calc.calculation_date,
            calculation_time: calc.calculation_time,
            shift: calc.shift,
            recorded_by: calc.recorded_by,
            notes: calc.notes,
            items: (calc.items || []).map((item) => {
              const rawTankId = item.tank_id || item.tank;
              let numericTankId = null;

              // 1. Cek apakah rawTankId sudah numerik
              if (typeof rawTankId === 'number') {
                numericTankId = rawTankId;
              } else if (typeof rawTankId === 'string' && /^\d+$/.test(rawTankId.trim())) {
                numericTankId = parseInt(rawTankId.trim(), 10);
              } else {
                // 2. Jika offline ID (misal: 'tk_...'), cari di master tangki lokal
                const matchedTank = allTanks.find(
                  (t) =>
                    t.id === rawTankId ||
                    (item.tank_code &&
                      t.code &&
                      t.code.toUpperCase() === item.tank_code.toUpperCase())
                );
                if (matchedTank) {
                  if (typeof matchedTank.id === 'number') {
                    numericTankId = matchedTank.id;
                  } else if (
                    matchedTank.server_id &&
                    (typeof matchedTank.server_id === 'number' ||
                      /^\d+$/.test(String(matchedTank.server_id).trim()))
                  ) {
                    numericTankId = parseInt(String(matchedTank.server_id).trim(), 10);
                  }
                }
              }

              return {
                tank_id: numericTankId, // Hanya kirim number atau null (jangan string 'tk_...')
                tank_code: item.tank_code,
                sounding_cm: item.sounding_cm,
                liter_per_cm: item.liter_per_cm,
                notes: item.notes,
              };
            }),
          };
        }),
      };

      const response = await fetch(`${baseUrl}/api/jetty-calculations/bulk-sync/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errDetail = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.detail || errData.error || errData.message) {
            errDetail = errData.detail || errData.error || errData.message;
          }
        } catch (_) {}
        throw new Error(errDetail);
      }

      const resData = await response.json();
      if (resData.status === 'success' && Array.isArray(resData.results)) {
        storageService.markAsSynced(resData.results);
        return {
          success: true,
          synced_count: resData.synced_count,
          message: `Berhasil menyinkronkan ${resData.synced_count} catatan ke server.`,
        };
      } else {
        throw new Error(resData.message || 'Format respon server tidak dikenali');
      }
    } catch (e) {
      return {
        success: false,
        message: e.message || 'Gagal mengirim data ke server',
        synced_count: 0,
      };
    }
  },

  /**
   * Kirim master tangki lokal ke server jika user membuat tangki baru secara offline
   */
  async pushTankToServer(tank) {
    const baseUrl = this.getBaseUrl();
    try {
      const payload = {
        code: tank.code,
        name: tank.name,
        liter_per_cm: tank.liter_per_cm,
        capacity_liters: tank.capacity_liters || 0,
        is_active: tank.is_active,
        display_order: tank.display_order || 0,
        notes: tank.notes || '',
      };

      const serverId = tank.server_id || (typeof tank.id === 'number' ? tank.id : null);
      const isExistingOnServer = Boolean(serverId);

      const url = isExistingOnServer
        ? `${baseUrl}/api/jetty-tanks/${serverId}/`
        : `${baseUrl}/api/jetty-tanks/`;

      const method = isExistingOnServer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (e) {
      console.warn('Gagal push tank ke server, tetap disimpan offline:', e);
      return null;
    }
  },
};
