import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, RefreshCw, Download } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#262626]">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Barangay */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/20">
            <span className="text-lg sm:text-xl select-none">🏀</span>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 border-2 border-[#121212]"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1 leading-tight">
                MARANGOG HOOPS
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 truncate flex items-center gap-1 leading-tight">
              <span>Barangay Marangog, Bogo City</span>
              <span className="text-neutral-600">•</span>
              <span className="text-cyan-400 font-bold">Live Board</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 text-[11px] sm:text-xs font-semibold transition-all"
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
            className="p-1.5 sm:p-2 text-neutral-300 hover:text-white bg-[#1E1E1E] hover:bg-neutral-800 border border-[#2e2e2e] rounded-lg transition-all"
            title="Refresh game board"
            aria-label="Refresh game board"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          {/* User Account or Guest Action */}
          {isGuest ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sulod</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#1E1E1E] border border-[#2e2e2e] rounded-lg p-0.5 sm:p-1 pl-1.5 sm:pl-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity"
                title="Edit profile & Purok"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-[10px] sm:text-[11px]">
                  {profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-[11px] font-bold text-white leading-tight truncate max-w-[85px]">
                    {profile?.display_name}
                  </div>
                  <div className="text-[9px] text-cyan-400 font-semibold leading-none truncate max-w-[85px]">
                    {profile?.purok}
                  </div>
                </div>
              </button>

              <button
                onClick={signOut}
                className="p-1 sm:p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
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
