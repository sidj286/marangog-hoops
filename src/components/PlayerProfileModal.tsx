import React from 'react';
import type { Profile, Post } from '../types';
import { X, MapPin } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';

interface PlayerProfileModalProps {
  player: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  posts?: Post[];
  onFilterByPlayer?: (playerName: string) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  posts = [],
  onFilterByPlayer,
}) => {
  if (!isOpen || !player) return null;

  // Calculate this player's activity
  const playerPosts = posts.filter(
    (p) => p.user_id === player.id || p.profile?.display_name === player.display_name
  );
  const activePostsCount = playerPosts.filter((p) => !p.is_concluded).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-[360px] sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col text-slate-900 animate-scale-up">
        {/* Top Header Card */}
        <div className="relative px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 bg-slate-50 border-b border-slate-200">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 mb-1.5">
            <BasketballIcon className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Marangog Baller Profile
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {player.display_name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>{player.purok}</span>
            </span>

            {player.monicker && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span>"{player.monicker}"</span>
              </span>
            )}
          </div>
        </div>

        {/* Details & Activity */}
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 bg-white text-xs sm:text-sm">
          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Purok / Sitio
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                {player.purok}
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Aktibong Post
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                {activePostsCount} ka duwa
              </div>
            </div>
          </div>

          {/* Quick Notice / Description */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
            <p>
              This player has an account on <strong className="text-slate-900">Marangog Hoops</strong> and can see your posts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex gap-2">
            {onFilterByPlayer && (
              <button
                type="button"
                onClick={() => {
                  onFilterByPlayer(player.display_name);
                  onClose();
                }}
                className="flex-1 py-2 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold rounded-lg text-xs shadow-sm shadow-[#F59E0B]/25 active:scale-95 transition-all text-center"
              >
                Tan-awa iyang mga Post
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
