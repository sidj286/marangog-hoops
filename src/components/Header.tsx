import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Database, RefreshCw, Download, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenSqlModal: () => void;
  onRefreshFeed: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSqlModal,
  onRefreshFeed,
  isRefreshing,
}) => {
  const { profile, isGuest, isSupabaseLive, signOut, setIsAuthModalOpen, setIsProfileModalOpen } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Barangay */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-500/25 border border-orange-400/40">
            <span className="text-xl select-none">🏀</span>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-court flex items-center gap-1">
                MARANGOG HOOPS
                <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 bg-orange-950/80 px-1.5 py-0.2 rounded border border-orange-800/60 ml-0.5">
                  PWA
                </span>
              </h1>
            </div>
            <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
              <span>Barangay Marangog, Bogo City</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> Court Live
              </span>
            </p>
          </div>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 text-xs font-bold transition-all animate-pulse"
              title="Install Marangog Hoops PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">I-install</span>
            </button>
          )}

          {/* Refresh Feed */}
          <button
            onClick={onRefreshFeed}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            title="Refresh game board"
            aria-label="Refresh game board"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Supabase Schema & Config Modal button */}
          <button
            onClick={onOpenSqlModal}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              isSupabaseLive
                ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800'
                : 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Database Schema & Supabase Status"
            aria-label="Database Schema & Supabase Status"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* User Account or Guest Action */}
          {isGuest ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all font-court"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sulod</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 pl-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity"
                title="Edit profile & Purok"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-black text-[11px]">
                  {profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="hidden xs:block text-left pr-1">
                  <div className="text-[11px] font-bold text-slate-200 leading-tight truncate max-w-[85px]">
                    {profile?.display_name}
                  </div>
                  <div className="text-[9px] text-orange-400 font-semibold leading-none truncate max-w-[85px]">
                    {profile?.purok}
                  </div>
                </div>
              </button>

              <button
                onClick={signOut}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
