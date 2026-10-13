import React, { useState, useMemo } from 'react';
import type { Profile, Post } from '../types';
import { X, Search, MapPin, Users, ChevronRight, Activity } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';

interface PlayersDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Profile[];
  posts?: Post[];
  onSelectPlayer: (player: Profile) => void;
}

export const PlayersDirectoryModal: React.FC<PlayersDirectoryModalProps> = ({
  isOpen,
  onClose,
  players,
  posts = [],
  onSelectPlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurok, setSelectedPurok] = useState<string>('ALL');

  // Extract all unique Puroks for quick filtering
  const purokList = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.purok?.trim()) set.add(p.purok.trim());
    });
    return Array.from(set).sort();
  }, [players]);

  // Filtered players based on search query & selected purok
  const filteredPlayers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return players.filter((player) => {
      if (selectedPurok !== 'ALL' && player.purok !== selectedPurok) {
        return false;
      }

      if (q) {
        const nameMatch = player.display_name?.toLowerCase().includes(q);
        const purokMatch = player.purok?.toLowerCase().includes(q);
        const monickerMatch = player.monicker?.toLowerCase().includes(q);
        if (!nameMatch && !purokMatch && !monickerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [players, searchQuery, selectedPurok]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-[420px] sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] text-slate-900 animate-scale-up">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-3.5 bg-slate-50 border-b border-slate-200">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Barangay Marangog Ballers
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              See also who is here
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-black font-extrabold text-[10px] shadow-2xs">
              {players.length} players
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            Tan-awa ang tanang mga magduduwa nga adunay rehistradong account sa Marangog Hoops.
          </p>

          {/* Search Box */}
          <div className="mt-2.5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pangitaa pinaagi sa Ngalan o Purok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-700 text-xs p-0.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Purok Filter Pills */}
          {purokList.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedPurok('ALL')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all border ${
                  selectedPurok === 'ALL'
                    ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tanan ({players.length})
              </button>
              {purokList.map((purok) => {
                const count = players.filter((p) => p.purok === purok).length;
                return (
                  <button
                    key={purok}
                    type="button"
                    onClick={() => setSelectedPurok(purok)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all border ${
                      selectedPurok === purok
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {purok} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-white">
          {filteredPlayers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-800">Walay magduduwa nga nakit-an.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Sulayi pag-usab ang imong gipangita nga ngalan o purok.
              </p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              // Calculate active court posts
              const playerPosts = posts.filter(
                (p) => (p.user_id === player.id || p.profile?.display_name === player.display_name) && !p.is_concluded
              );

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => onSelectPlayer(player)}
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-[#F59E0B] hover:bg-amber-50/40 bg-white flex items-center justify-between gap-2.5 transition-all text-left shadow-2xs group cursor-pointer"
                  title="Tan-awa ang Profile"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100/70 border border-amber-200 flex items-center justify-center shrink-0 text-[#F59E0B]">
                      <BasketballIcon className="w-4 h-4 text-[#F59E0B]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#D97706] truncate">
                          {player.display_name}
                        </span>
                        {player.monicker && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            "{player.monicker}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                          <MapPin className="w-2.5 h-2.5 text-[#06B6D4]" />
                          {player.purok || 'Marangog'}
                        </span>

                        {playerPosts.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            <Activity className="w-2.5 h-2.5 text-[#F59E0B]" />
                            {playerPosts.length} aktibo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-800 shrink-0">
                    <span className="text-[10px] font-bold hidden min-[360px]:inline text-slate-400 group-hover:text-[#D97706]">
                      Profile
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-slate-500">
            Nakit-an: <strong className="text-slate-800">{filteredPlayers.length}</strong> sa {players.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs border border-slate-200 transition-colors"
          >
            Isara
          </button>
        </div>
      </div>
    </div>
  );
};
