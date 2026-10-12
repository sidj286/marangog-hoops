import React from 'react';
import { Clock, Flame, Users } from 'lucide-react';
import type { Post } from '../types';

interface CommunityNoticeProps {
  posts: Post[];
}

export const CommunityNotice: React.FC<CommunityNoticeProps> = ({ posts }) => {
  const activeCount = posts.filter(p => !p.is_concluded).length;
  const nanulongCount = posts.filter(p => p.category === 'Naa Nanulong' && !p.is_concluded).length;
  const needPlayerCount = posts.filter(p => p.category === 'Need Player' && !p.is_concluded).length;

  return (
    <div className="mb-4 space-y-2">
      {/* Active stats bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2.5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium">Aktibong Duwa</div>
            <div className="text-sm font-black text-white font-court">{activeCount} ka post</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2.5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium">Nanulong / Dayo</div>
            <div className="text-sm font-black text-white font-court">
              {nanulongCount > 0 ? `${nanulongCount} grupo` : 'Wala pa'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2.5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium">Kulang Player</div>
            <div className="text-sm font-black text-white font-court">
              {needPlayerCount > 0 ? `${needPlayerCount} court` : 'Kompleto'}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Hour Expiration & Barangay Culture Banner */}
      <div className="bg-gradient-to-r from-orange-950/30 via-slate-900/80 to-slate-900/80 border border-orange-900/30 rounded-2xl p-3 flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs text-slate-300 leading-snug min-w-0">
          <span className="font-bold text-orange-300">12-Hour Court Cycle:</span>{' '}
          Ang tanang post awtomatikong mo-expire human sa 12 ka oras aron lab-as pirmi ang updates sa Barangay Marangog basketball courts.
        </div>
      </div>
    </div>
  );
};
