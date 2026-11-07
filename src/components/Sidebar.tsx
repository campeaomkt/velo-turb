import React from 'react';
import { Video, HardDrive, FlaskConical, Shield, Target, Settings, GraduationCap, HelpCircle } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  videoCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  videoCount,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string }[] = [
    { id: 'videos', label: 'Meus vídeos', icon: Video, badge: videoCount },
    { id: 'hosting', label: 'Hospedagem & CDN', icon: HardDrive, badge: 'Nativo' },
    { id: 'ab_tests', label: 'Testes A/B', icon: FlaskConical },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'conversions', label: 'Conversões', icon: Target },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'help', label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <aside className="w-56 sm:w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-4rem)]">
      
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-sky-200/60 text-sky-800 font-bold' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>VeloTurb Player</span>
        <span className="font-mono">v1.20.26</span>
      </div>

    </aside>
  );
};
