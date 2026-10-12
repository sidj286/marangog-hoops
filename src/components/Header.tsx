import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, RefreshCw, Download } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';

interface HeaderProps {
  onRefreshFeed: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshFeed,
  isRefreshing,
}) => {
  const { profile, isGuest, signOut, setIsAuthModalOpen, setIsProfileModalOpen } = useAuth();
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#f8c2ac]/50 shadow-xs">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Barangay */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#ee6730] text-white shadow-sm shadow-[#ee6730]/20">
            <BasketballIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-stone-900 flex items-center gap-1 leading-tight">
                MARANGOG HOOPS
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-stone-500 truncate flex items-center gap-1 leading-tight">
              <span>Barangay Marangog, Bogo City</span>
              <span className="text-stone-300">•</span>
              <span className="text-[#ee6730] font-bold">Live Board</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#fce1d6] text-[#ee6730] border border-[#f8c2ac] hover:bg-[#f8c2ac]/60 text-[11px] sm:text-xs font-semibold transition-all"
              title="Install Marangog Hoops PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Refresh Feed */}
          <button
            onClick={onRefreshFeed}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 bg-white hover:bg-[#fce1d6]/50 border border-stone-200 rounded-lg transition-all"
            title="Refresh game board"
            aria-label="Refresh game board"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 ${isRefreshing ? 'animate-spin text-[#ee6730]' : ''}`} />
          </button>

          {/* User Account or Guest Action */}
          {isGuest ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#ee6730] hover:bg-[#d85620] text-white font-bold text-xs shadow-sm shadow-[#ee6730]/20 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sulod</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 sm:p-1 pl-1.5 sm:pl-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity"
                title="Edit profile & Purok"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#fce1d6] border border-[#f8c2ac] text-[#ee6730] flex items-center justify-center font-bold text-[10px] sm:text-[11px]">
                  {profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-[11px] font-bold text-stone-800 leading-tight truncate max-w-[85px]">
                    {profile?.display_name}
                  </div>
                  <div className="text-[9px] text-[#ee6730] font-semibold leading-none truncate max-w-[85px]">
                    {profile?.purok}
                  </div>
                </div>
              </button>

              <button
                onClick={signOut}
                className="p-1 sm:p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 transition-colors"
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
