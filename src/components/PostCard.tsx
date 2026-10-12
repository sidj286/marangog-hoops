import React, { useState } from 'react';
import type { Post } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime, getRemainingTimeText } from '../lib/time';
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
  onOpenComments: (post: Post) => void;
  onToggleHeadcount: (postId: string) => void;
  onToggleConcluded: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onToggleHeadcount,
  onToggleConcluded,
  onDeletePost,
}) => {
  const { user, requireAuth } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categoryMeta = CATEGORIES[post.category] || CATEGORIES['Magduwa Hapon'];
  const remainingTime = getRemainingTimeText(post.created_at);
  const isAuthor = user?.id === post.user_id;

  const handleHeadcountClick = () => {
    requireAuth(() => {
      onToggleHeadcount(post.id);
      if (!post.user_has_joined) {
        // Trigger celebratory confetti burst for joining the basketball game
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ea580c', '#f97316', '#fbbf24', '#ffffff']
        });
      }
    }, "Paghimo'g account o log in aron maka-apil sa headcount ('Mo-apil Ko') sa duwa!");
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

  return (
    <article
      className={`relative bg-slate-900/90 rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
        post.is_concluded 
          ? 'border-slate-800/80 opacity-75' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Expiration Progress Line */}
      <div className="w-full bg-slate-950 h-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            remainingTime.isExpired 
              ? 'bg-slate-700' 
              : remainingTime.percentLeft < 20 
              ? 'bg-red-500' 
              : 'bg-gradient-to-r from-orange-500 to-amber-500'
          }`}
          style={{ width: `${remainingTime.percentLeft}%` }}
        />
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-2">
          {/* Category & Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${categoryMeta.badgeBg}`}
            >
              <span>{categoryMeta.emoji}</span>
              <span>{categoryMeta.label}</span>
            </span>

            {post.is_concluded ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                <Check className="w-3 h-3 text-emerald-400" />
                Human Na
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-950/80 text-slate-400 border border-slate-800">
                <Clock className="w-3 h-3 text-orange-400" />
                {remainingTime.text}
              </span>
            )}

            {/* Players Needed highlight badge */}
            {post.category === 'Need Player' && post.players_needed > 0 && !post.is_concluded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <span>Kulang:</span>
                <span className="bg-amber-500 text-slate-950 px-1 rounded font-black">
                  {post.players_needed}
                </span>
              </span>
            )}
          </div>

          {/* More actions menu (Author or Share) */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={handleShareClick}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                title="Share post"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {isAuthor && (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Author settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Author Dropdown */}
            {showMenu && isAuthor && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 top-8 z-40 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleConcluded(post.id);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{post.is_concluded ? 'I-balik Aktibo' : 'I-mark Human Na'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm('Sigurado ka nga papason kini nga post?')) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Papasa ang Post</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Author & Court details */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Author Avatar Badge */}
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
              {post.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-200 truncate">
                  {post.profile?.display_name || 'Marangog Baller'}
                </span>
                {/* Purok Badge */}
                <span className="text-[10px] font-semibold bg-slate-800 text-orange-300 px-1.5 py-0.2 rounded border border-slate-700 shrink-0">
                  {post.profile?.purok || 'Marangog'}
                </span>
                {post.profile?.monicker && (
                  <span className="text-[10px] text-slate-400 italic hidden sm:inline">
                    "{post.profile.monicker}"
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>
          </div>

          {/* Court Name with Pin */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/80 shrink-0 max-w-[140px] sm:max-w-none truncate">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate">{post.court_name}</span>
          </div>
        </div>

        {/* Post Message Body */}
        <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {post.message}
        </div>

        {/* Headcount Attendees Roster Preview if available */}
        {post.headcount_roster && post.headcount_roster.length > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 text-[10px]">Mga Ni-apil:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {post.headcount_roster.slice(0, 4).map((player, idx) => (
                <span 
                  key={player.id || idx}
                  className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-200"
                >
                  {player.display_name} <span className="text-orange-400 text-[9px]">({player.purok})</span>
                </span>
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
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* "Mo-apil Ko" (I'm In / Headcount) Button */}
          <button
            onClick={handleHeadcountClick}
            disabled={post.is_concluded}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              post.user_has_joined
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${post.user_has_joined ? 'text-emerald-400' : 'text-orange-400'}`} />
            <span>{post.user_has_joined ? 'Ni-apil Naka! ✓' : 'Mo-apil Ko'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-200">
              {post.headcounts_count || 0}
            </span>
          </button>

          {/* Expand Comments ("Tubag dinhi...") Button */}
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/20 text-xs font-bold transition-all active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
            <span>
              {post.comments_count && post.comments_count > 0 
                ? `💬 ${post.comments_count} tubag` 
                : 'Tubag dinhi...'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
