import React from 'react';
import type { Profile } from '../types';
import { parseMentions } from '../lib/mentions';

interface MentionTextProps {
  text: string;
  players?: Profile[];
  onSelectPlayer?: (player: Profile) => void;
  className?: string;
}

export const MentionText: React.FC<MentionTextProps> = ({
  text,
  players = [],
  onSelectPlayer,
  className = '',
}) => {
  const parts = parseMentions(text, players);

  if (parts.length === 0) return null;

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <React.Fragment key={index}>{part.content}</React.Fragment>;
        }

        if (part.player) {
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlayer?.(part.player!);
              }}
              className="inline-flex items-center gap-0.5 font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 px-1.5 py-0.2 rounded-md text-[11px] sm:text-xs transition-colors cursor-pointer align-baseline mx-0.5 shadow-2xs active:scale-95"
              title={`Tan-awa ang Profile ni ${part.player.display_name} (${part.player.purok})`}
            >
              <span className="text-[#D97706] font-black">@</span>
              <span className="hover:underline">{part.player.display_name}</span>
            </button>
          );
        }

        return (
          <span
            key={index}
            className="inline-flex items-center gap-0.5 font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded text-[11px] sm:text-xs align-baseline mx-0.5"
          >
            <span className="text-[#D97706] font-black">@</span>
            <span>{part.content}</span>
          </span>
        );
      })}
    </span>
  );
};
