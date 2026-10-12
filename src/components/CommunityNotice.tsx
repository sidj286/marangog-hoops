import React from 'react';
import { Clock, Swords, UserPlus } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';
import type { Post } from '../types';

interface CommunityNoticeProps {
  posts: Post[];
}

export const CommunityNotice: React.FC<CommunityNoticeProps> = ({ posts }) => {
  const activeCount = posts.filter(p => !p.is_concluded).length;
  const nanulongCount = posts.filter(p => p.category === 'Naa Nanulong' && !p.is_concluded).length;
  const needPlayerCount = posts.filter(p => p.category === 'Need Player' && !p.is_concluded).length;

  return (
    <div className="mb-5 space-y-3">
      {/* Dashboard Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-pulse" />
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#F1F5F9]">
            Live Court Dashboard
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-[#94A3B8]">
          Barangay Marangog
        </span>
      </div>

      {/* Active stats bar - Enlarged & Prominent Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {/* 1. Aktibong Duwa */}
        <div className="bg-[#151E32] border-2 border-[#22304E] hover:border-[#FF5500] rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 shrink-0">
              <BasketballIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {activeCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                <span className="hidden min-[420px]:inline">Live</span>
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-baseline gap-1 text-base sm:text-2xl font-black text-[#F1F5F9] tracking-tight leading-tight">
              <span>{activeCount}</span>
              <span className="text-xs sm:text-sm font-bold text-[#94A3B8]">
                ka post
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#94A3B8] mt-0.5 truncate">
              Aktibong Duwa
            </div>
          </div>
        </div>

        {/* 2. Nanulong */}
        <div className="bg-[#151E32] border-2 border-[#22304E] hover:border-red-500 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full">
            <div className="p-2 sm:p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {nanulongCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="hidden min-[420px]:inline">Dayo</span>
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className={`flex flex-wrap items-baseline gap-1 text-base sm:text-2xl font-black tracking-tight leading-tight ${
              nanulongCount > 0 ? 'text-red-400' : 'text-[#F1F5F9]'
            }`}>
              {nanulongCount > 0 ? (
                <>
                  <span>{nanulongCount}</span>
                  <span className="text-xs sm:text-sm font-bold text-red-400/80">
                    grupo
                  </span>
                </>
              ) : (
                <span>Wala pa</span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#94A3B8] mt-0.5 truncate">
              Nanulong
            </div>
          </div>
        </div>

        {/* 3. Kulang Player */}
        <div className="bg-[#151E32] border-2 border-[#22304E] hover:border-[#00D2FF] rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              needPlayerCount > 0
                ? 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {needPlayerCount > 0 ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
                <span className="hidden min-[420px]:inline">Kulang</span>
              </span>
            ) : (
              <span className="hidden min-[420px]:inline px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                OK
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className={`flex flex-wrap items-baseline gap-1 text-base sm:text-2xl font-black tracking-tight leading-tight ${
              needPlayerCount > 0 ? 'text-[#00D2FF]' : 'text-emerald-400'
            }`}>
              {needPlayerCount > 0 ? (
                <>
                  <span>{needPlayerCount}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#00D2FF]/80">
                    court
                  </span>
                </>
              ) : (
                <span>Kompleto</span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#94A3B8] mt-0.5 truncate">
              Kulang Player
            </div>
          </div>
        </div>
      </div>

      {/* 12-Hour Expiration Notice Banner */}
      <div className="bg-[#151E32] border border-[#22304E] rounded-2xl p-3 sm:p-3.5 flex items-start sm:items-center gap-2.5 sm:gap-3">
        <div className="p-1.5 rounded-lg bg-[#FF5500]/15 text-[#FF5500] shrink-0 mt-0.5 sm:mt-0">
          <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-300 leading-snug min-w-0">
          <span className="font-bold text-[#FF5500]">12-Hour Daily Board:</span>{' '}
          Ang tanang post awtomatikong mo-expire human sa 12 ka oras aron lab-as pirmi ang updates sa Barangay Marangog basketball courts.
        </div>
      </div>
    </div>
  );
};
