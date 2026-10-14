import React, { useState } from 'react';
import type { Post, Profile } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatTimeAgo } from '../lib/time';
import { CategoryIcon } from './CategoryIcon';
import { MentionText } from './MentionText';
import confetti from 'canvas-confetti';
import { 
  MapPin, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Trash2, 
  MoreVertical, 
  Check, 
  Share2, 
  Clock, 
  UserCheck
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  players?: Profile[];
  onOpenComments: (post: Post) => void;
  onToggleHeadcount: (postId: string) => void;
  onToggleConcluded: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSelectPlayer?: (player: Profile) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  players = [],
  onOpenComments,
  onToggleHeadcount,
  onToggleConcluded,
  onDeletePost,
  onSelectPlayer,
}) => {
  const { user, requireAuth } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categoryMeta = CATEGORIES[post.category] || CATEGORIES['Magduwa Hapon'];
  const isAuthor = user?.id === post.user_id;

  const handleHeadcountClick = () => {
    requireAuth(() => {
      onToggleHeadcount(post.id);
      if (!post.user_has_joined) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#F59E0B', '#06B6D4', '#F3F4F6', '#1E1E1E']
        });
      }
    }, "Paghimo'g account o log in aron maka-join sa duwa!");
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: `Marangog Hoops: ${post.category}`,
        text: `${post.category} sa ${post.court_name}: "${post.message}"`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `[Marangog Hoops] ${post.category} sa ${post.court_name}: "${post.message}"`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Player initials for avatar
  const playerInitials = (post.profile?.display_name || 'MB')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MB';

  return (
    <article
      className={`relative rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs ${
        post.is_concluded 
          ? 'border-slate-200 opacity-70 bg-slate-50/70' 
          : 'border-slate-200 hover:border-[#F59E0B] hover:shadow-md bg-white'
      }`}
    >
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* 1. Header: Author Identity + Time + Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Player Avatar */}
            <button
              type="button"
              onClick={() => post.profile && onSelectPlayer?.(post.profile)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-[#F59E0B] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs border border-amber-300 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="Tan-awa ang Profile sa Player"
            >
              {playerInitials}
            </button>

            {/* Author Name, Purok, Time */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => post.profile && onSelectPlayer?.(post.profile)}
                  className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-[#D97706] hover:underline truncate max-w-[170px] sm:max-w-xs text-left transition-colors cursor-pointer leading-tight"
                  title="Tan-awa ang Profile sa Player"
                >
                  {post.profile?.display_name || 'Marangog Baller'}
                </button>
                {/* Purok Badge */}
                <button
                  type="button"
                  onClick={() => post.profile && onSelectPlayer?.(post.profile)}
                  className="text-[10px] sm:text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200 shrink-0 transition-colors cursor-pointer leading-none"
                  title="Purok sa Player"
                >
                  {post.profile?.purok || 'Marangog'}
                </button>
              </div>

              {/* Time Ago */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* More actions menu (Author or Share) */}
          <div className="relative shrink-0 flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleShareClick}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Share post"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            {isAuthor && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Author settings"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}

            {/* Author Dropdown */}
            {showMenu && isAuthor && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 top-8 z-40 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs text-slate-800">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleConcluded(post.id);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{post.is_concluded ? 'Mark as Active' : 'Mark as Concluded'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm('Are you sure you want to delete this post?')) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. Game Details Strip: Category + Court + Status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${categoryMeta.badgeBg}`}
          >
            <CategoryIcon category={post.category} className="w-3.5 h-3.5 shrink-0" />
            <span>{categoryMeta.label}</span>
          </span>

          {/* Court Name with Pin */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 max-w-full">
            <MapPin className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Basket Ball Court:</span>
            <span className="font-bold text-slate-900 truncate">{post.court_name}</span>
          </div>

          {post.is_concluded && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <Check className="w-3 h-3 text-emerald-500" />
              Concluded
            </span>
          )}

          {/* Players Needed badge */}
          {post.category === 'Need Player' && post.players_needed > 0 && !post.is_concluded && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
              <span>Kulang:</span>
              <span className="bg-[#06B6D4] text-black px-1 rounded text-[10px] font-black">
                {post.players_needed}
              </span>
            </span>
          )}
        </div>

        {/* 3. Post Message Body */}
        <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
          <MentionText text={post.message} players={players} onSelectPlayer={onSelectPlayer} />
        </div>

        {/* Headcount Attendees Roster Preview if available */}
        {post.headcount_roster && post.headcount_roster.length > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <UserCheck className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span className="text-slate-500 text-[10px]">Joined:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {post.headcount_roster.slice(0, 4).map((player, idx) => (
                <button 
                  key={player.id || idx}
                  type="button"
                  onClick={() => onSelectPlayer?.(player)}
                  className="bg-white hover:bg-amber-50 hover:border-[#F59E0B] border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-800 transition-colors cursor-pointer"
                  title="Tan-awa ang Profile sa Player"
                >
                  {player.display_name} <span className="text-[#06B6D4] text-[9px] font-bold">({player.purok})</span>
                </button>
              ))}
              {post.headcount_roster.length > 4 && (
                <span className="text-slate-500 text-[10px]">
                  +{post.headcount_roster.length - 4} pa
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Interactive Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Join / Headcount Button */}
          <button
            onClick={handleHeadcountClick}
            disabled={post.is_concluded}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex-1 sm:flex-initial ${
              post.user_has_joined
                ? 'bg-[#F59E0B] text-black font-extrabold border border-[#F59E0B]'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${post.user_has_joined ? 'text-black' : 'text-[#D97706]'}`} />
            {post.user_has_joined ? (
              <span className="inline-flex items-center gap-1 text-black font-extrabold">
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </span>
            ) : (
              <span>Join</span>
            )}
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              post.user_has_joined 
                ? 'bg-black/20 text-black font-extrabold' 
                : 'bg-white border border-slate-200 text-slate-800'
            }`}>
              {post.headcounts_count || 0}
            </span>
          </button>

          {/* Expand Comments ("Comment") Button */}
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all active:scale-95 flex-1 sm:flex-initial"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>
              {post.comments_count && post.comments_count > 0 
                ? `${post.comments_count} ${post.comments_count === 1 ? 'Comment' : 'Comments'}` 
                : 'Comment'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
