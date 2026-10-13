import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Download, User } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';

interface HeaderProps {
  onRefreshFeed?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
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
    <header className="sticky top-0 z-30 bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#2D2D2D] shadow-xs">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Barangay */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F59E0B] text-black shadow-sm shadow-[#F59E0B]/25">
            <BasketballIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-[#F3F4F6] flex items-center gap-1 leading-tight">
                MARANGOG HOOPS
              </h1>
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[#9CA3AF] flex items-center gap-1 sm:gap-1.5 leading-tight">
              <span className="truncate max-w-[95px] min-[360px]:max-w-[125px] min-[420px]:max-w-none">
                <span className="hidden min-[380px]:inline">Barangay </span>Marangog, Bogo City
              </span>
              <span className="text-[#4B5563] shrink-0">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold shrink-0 whitespace-nowrap">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="animate-pulse">Live Board</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#262626] text-[#F3F4F6] border border-[#333333] hover:border-[#F59E0B] text-[11px] sm:text-xs font-semibold transition-all"
              title="Install Marangog Hoops PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* User Account or Guest Action */}
          {isGuest ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold text-xs shadow-sm shadow-[#F59E0B]/25 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#262626] border border-[#333333] rounded-xl p-1 pl-1.5 sm:pl-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 text-left hover:opacity-90 transition-opacity cursor-pointer min-w-0"
                title="Tan-awa o usba ang imong Profile"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#F59E0B] text-black flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
                </div>
                <div className="text-left pr-1 min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-[#F3F4F6] leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                    {profile?.display_name || 'Player'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold leading-none truncate max-w-[120px] sm:max-w-[180px]">
                    {profile?.purok || 'Marangog'}
                  </div>
                </div>
              </button>

              <button
                onClick={signOut}
                className="p-1 sm:p-1.5 text-[#9CA3AF] hover:text-rose-400 rounded-lg hover:bg-[#1E1E1E] transition-colors shrink-0 cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
