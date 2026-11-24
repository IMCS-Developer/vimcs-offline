import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  History,
  Database,
  Settings,
  HardDrive,
  X,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  pendingCount,
  tankCount,
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'sounding-new',
      label: 'Input Sounding Tera',
      icon: Calculator,
      badge: 'Baru',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'history',
      label: 'Riwayat Kalkulasi',
      icon: History,
      badge: pendingCount > 0 ? `${pendingCount} offline` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'master-tanks',
      label: 'Master Tangki Jetty',
      icon: Database,
      badge: `${tankCount} Tangki`,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'sync-settings',
      label: 'Sinkronisasi & Setup',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-14 h-full md:h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header inside sidebar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <span className="font-bold text-slate-800 text-sm">Navigasi Sistem</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Operasional
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-2 p-2 rounded-md bg-white border border-slate-200/80 text-slate-600">
            <HardDrive className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-xs leading-tight">
              <div className="font-semibold text-slate-700">Offline-First Engine</div>
              <div className="text-slate-400 text-xs">Data tersimpan lokal</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
