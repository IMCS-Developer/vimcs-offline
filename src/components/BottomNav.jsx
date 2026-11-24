import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  History,
  Database,
  Settings,
} from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, pendingCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'sounding-new', label: 'Input', icon: Calculator },
    {
      id: 'history',
      label: 'Riwayat',
      icon: History,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { id: 'master-tanks', label: 'Tangki', icon: Database },
    { id: 'sync-settings', label: 'Sync', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'text-sky-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
