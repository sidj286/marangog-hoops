import React, { useState, useMemo } from 'react';
import type { Profile } from '../types';
import { AtSign, Search, X, MapPin } from 'lucide-react';

interface MentionSuggestionsProps {
  players: Profile[];
  filterQuery?: string;
  onSelect: (player: Profile) => void;
  onClose: () => void;
  title?: string;
}

export const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  players,
  filterQuery = '',
  onSelect,
  onClose,
  title = 'I-mention nga Player (@)',
}) => {
  const [internalSearch, setInternalSearch] = useState('');

  const activeQuery = (internalSearch || filterQuery).toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!activeQuery) {
      return players.slice(0, 8);
    }
    return players
      .filter((p) => {
        const name = (p.display_name || '').toLowerCase();
        const purok = (p.purok || '').toLowerCase();
        const monicker = (p.monicker || '').toLowerCase();
        return name.includes(activeQuery) || purok.includes(activeQuery) || monicker.includes(activeQuery);
      })
      .slice(0, 8);
  }, [players, activeQuery]);

  return (
    <div className="bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden text-slate-900 z-50 animate-fade-in divide-y divide-slate-100">
      {/* Header bar */}
      <div className="px-3 py-2 bg-slate-50 flex items-center justify-between gap-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#D97706] flex items-center justify-center shrink-0">
            <AtSign className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-slate-800 truncate">{title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          aria-label="Isara ang mention suggestions"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick filter input if list is large or no query typed yet */}
      <div className="p-2 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Pangitaa ang ngalan o purok..."
            value={internalSearch || filterQuery}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1 pl-8 pr-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B]"
            autoFocus
          />
        </div>
      </div>

      {/* Player List */}
      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-500">
            Walay player nga motugma sa "{activeQuery}".
          </div>
        ) : (
          filtered.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelect(player)}
              className="w-full px-3 py-2 text-left hover:bg-amber-50/80 active:bg-amber-100/80 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-[#F59E0B]/20 text-slate-600 group-hover:text-[#D97706] font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                  {player.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-950 truncate flex items-center gap-1">
                    <span className="text-[#D97706]">@</span>
                    <span>{player.display_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#06B6D4]" />
                  {player.purok}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
        <span>I-tap aron i-tag sa mensahe</span>
        <span className="font-semibold text-slate-600">{filtered.length} players</span>
      </div>
    </div>
  );
};
