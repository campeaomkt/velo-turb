import React, { useState } from 'react';
import { Trophy, Bell, ChevronDown, Check, Sparkles, ExternalLink } from 'lucide-react';

interface HeaderProps {
  totalPlays: number;
  playRate: number;
}

export const Header: React.FC<HeaderProps> = ({ totalPlays, playRate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    { id: 1, title: '🔥 Retenção em Alta!', text: 'Sua VSL Principal ultrapassou 52% de retenção no pitch hoje.', time: 'Há 12 min' },
    { id: 2, title: '🛡️ Tentativa de cópia bloqueada', text: 'O sistema bloqueou 3 tentativas de download e acesso não autorizado.', time: 'Há 1 hora' },
    { id: 3, title: '🚀 Nova marca atingida!', text: 'Parabéns! Sua conta superou 300.000 visualizações de VSL.', time: 'Ontem' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      
      {/* Brand Zone (Left) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">
            Velo<span className="text-rose-600">Turb</span>
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 border-l border-slate-200 pl-3">
          Player de Alta Conversão para VSL
        </span>
      </div>

      {/* Right Zone: Gamification, Plays counter, Notifications, User Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Premiações / Gamification Progress */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Trophy className="w-4 h-4 text-sky-500" />
            <span>Premiações</span>
          </div>
          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
          </div>
        </div>

        {/* Total Plays Counter */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
          <span className="font-mono tabular-nums text-slate-900">
            {Math.round(totalPlays / 1000)}K Plays
          </span>
          <span className="text-xs font-semibold text-slate-400 tabular-nums">
            ({playRate}%)
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadCount(0);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-bold text-slate-900">Notificações da Conta</span>
                <span className="text-[11px] text-rose-600 font-semibold cursor-pointer">Marcar como lidas</span>
              </div>
              <div className="space-y-2 py-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 font-bold">{n.title}</strong>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
            GP
          </div>
          <span className="hidden md:inline-block text-xs font-bold text-slate-700">
            Campeão MKT
          </span>
        </div>

      </div>

    </header>
  );
};
