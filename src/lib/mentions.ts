import type { Profile } from '../types';

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface MentionPart {
  type: 'text' | 'mention';
  content: string;
  player?: Profile;
}

/**
 * Parses text into normal text slices and @mention segments.
 * Matches registered players' full names first, then single/multi-word mentions.
 */
export function parseMentions(text: string, players: Profile[] = []): MentionPart[] {
  if (!text) return [];

  // Sort players by display_name length descending so longer full names match first
  const sortedPlayers = [...players].sort((a, b) => 
    (b.display_name?.length || 0) - (a.display_name?.length || 0)
  );

  const playerPatterns = sortedPlayers
    .map(p => p.display_name?.trim())
    .filter(Boolean)
    .map(name => escapeRegex(name));

  const patternBody = playerPatterns.length > 0
    ? `(?:${playerPatterns.join('|')}|[\\w\\d_\\-\\.\\u00C0-\\u017F]+)`
    : `[\\w\\d_\\-\\.\\u00C0-\\u017F]+`;

  // Matches @Name when preceded by start-of-string, whitespace, or open parenthesis/quote
  const regex = new RegExp(`(^|[\\s(\\["'])@(${patternBody})`, 'gi');

  const parts: MentionPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const prefix = match[1]; // Leading character (space, paren, etc.)
    const mentionName = match[2]; // Matched name without @
    const matchStart = match.index + prefix.length;
    const matchEnd = regex.lastIndex;

    // Plain text before mention
    if (matchStart > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, matchStart),
      });
    }

    // Match against known players (case-insensitive)
    const matchedPlayer = sortedPlayers.find(
      p => p.display_name?.toLowerCase() === mentionName.toLowerCase()
    );

    parts.push({
      type: 'mention',
      content: mentionName,
      player: matchedPlayer,
    });

    lastIndex = matchEnd;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

