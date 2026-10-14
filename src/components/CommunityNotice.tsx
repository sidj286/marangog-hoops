import React from 'react';
import { Clock, Swords, UserPlus } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';
import type { Post } from '../types';

interface CommunityNoticeProps {
  posts: Post[];
}

export const CommunityNotice: React.FC<CommunityNoticeProps> = ({ 
  posts,
}) => {
  const activeCount = posts.filter(p => !p.is_concluded).length;
  const nanulongCount = posts.filter(p => p.category === 'Naa Nanulong' && !p.is_concluded).length;
  const needPlayerCount = posts.filter(p => p.category === 'Need Player' && !p.is_concluded).length;

  return (
    <div className="mb-5 space-y-3">
      {/* Dashboard Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Live Court Dashboard
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-600">
          Barangay Marangog
        </span>
      </div>

      {/* Active stats bar - Enlarged & Prominent Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {/* 1. Aktibong Duwa */}
        <div className="bg-white border-2 border-slate-200 hover:border-[#F59E0B] rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              activeCount > 0
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              <BasketballIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {activeCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="hidden min-[420px]:inline">Live</span>
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-baseline gap-1 text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              <span>{activeCount}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-500">
                ka post
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5 truncate">
              Aktibong Duwa
            </div>
          </div>
        </div>

        {/* 2. Nanulong */}
        <div className="bg-white border-2 border-slate-200 hover:border-rose-500 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              nanulongCount > 0
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {nanulongCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="hidden min-[420px]:inline">Dayo</span>
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className={`flex flex-wrap items-baseline gap-1 text-base sm:text-2xl font-black tracking-tight leading-tight ${
              nanulongCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              <span>{nanulongCount}</span>
              <span className={`text-xs sm:text-sm font-bold ${
                nanulongCount > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {nanulongCount > 0 ? 'grupo' : 'ka post'}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5 truncate">
              Nanulong
            </div>
          </div>
        </div>

        {/* 3. Kulang Player */}
        <div className="bg-white border-2 border-slate-200 hover:border-[#06B6D4] rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              needPlayerCount > 0
                ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {needPlayerCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
                <span className="hidden min-[420px]:inline">Kulang</span>
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className={`flex flex-wrap items-baseline gap-1 text-base sm:text-2xl font-black tracking-tight leading-tight ${
              needPlayerCount > 0 ? 'text-[#06B6D4]' : 'text-slate-900'
            }`}>
              <span>{needPlayerCount}</span>
              <span className={`text-xs sm:text-sm font-bold ${
                needPlayerCount > 0 ? 'text-[#06B6D4]' : 'text-slate-500'
              }`}>
                {needPlayerCount > 0 ? 'court' : 'ka post'}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5 truncate">
              Kulang Player
            </div>
          </div>
        </div>
      </div>

      {/* 12-Hour Expiration Notice Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-3.5 flex items-start sm:items-center gap-2.5 sm:gap-3 shadow-xs">
        <div className="p-1.5 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 shrink-0 mt-0.5 sm:mt-0">
          <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-600 leading-snug min-w-0">
          <span className="font-bold text-slate-900">12-Hour Daily Board:</span>{' '}
          Ang tanang post ma-expire human sa 12 ka oras aron pirmi updated ang mga manulaay sa MARANGOG HOOPS.
        </div>
      </div>

    </div>
  );
};
