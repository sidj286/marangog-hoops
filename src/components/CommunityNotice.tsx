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
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 text-orange-600 shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">Aktibong Duwa</div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{activeCount} ka post</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">Nanulong</div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              {nanulongCount > 0 ? `${nanulongCount} grupo` : 'Wala pa'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">Kulang Player</div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              {needPlayerCount > 0 ? `${needPlayerCount} court` : 'Kompleto'}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Hour Expiration Notice Banner */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 flex items-start gap-2.5">
        <div className="p-1 rounded-md bg-orange-200 text-orange-800 shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs text-orange-950 leading-snug min-w-0">
          <span className="font-bold text-orange-800">12-Hour Daily Board:</span>{' '}
          Ang tanang post awtomatikong mo-expire human sa 12 ka oras aron lab-as pirmi ang updates sa Barangay Marangog basketball courts.
        </div>
      </div>
    </div>
  );
};
