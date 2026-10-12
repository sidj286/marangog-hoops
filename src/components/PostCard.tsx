import React, { useState } from 'react';
import type { Post } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatTimeAgo } from '../lib/time';
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
  const isAuthor = user?.id === post.user_id;

  const handleHeadcountClick = () => {
    requireAuth(() => {
      onToggleHeadcount(post.id);
      if (!post.user_has_joined) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ea580c', '#f97316', '#fbbf24', '#ffffff']
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

  return (
    <article
      className={`relative bg-[#1E1E1E] rounded-xl border transition-all duration-150 overflow-hidden shadow-sm ${
        post.is_concluded 
          ? 'border-[#262626] opacity-70 bg-[#1E1E1E]/60' 
          : 'border-[#2e2e2e] hover:border-neutral-700 hover:shadow-md'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-2">
          {/* Category & Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${categoryMeta.badgeBg}`}
            >
              <span>{categoryMeta.emoji}</span>
              <span>{categoryMeta.label}</span>
            </span>

            {post.is_concluded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                <Check className="w-3 h-3 text-cyan-400" />
                Human Na
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#121212] text-neutral-400 border border-[#2e2e2e]">
              <Clock className="w-3 h-3 text-neutral-500" />
              {formatTimeAgo(post.created_at)}
            </span>

            {/* Players Needed badge */}
            {post.category === 'Need Player' && post.players_needed > 0 && !post.is_concluded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <span>Kulang:</span>
                <span className="bg-cyan-500 text-neutral-950 px-1 rounded text-[10px] font-extrabold">
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
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                title="Share post"
              >
                {copiedLink ? <Check className="w-4 h-4 text-cyan-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {isAuthor && (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
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
                <div className="absolute right-0 top-8 z-40 w-44 bg-[#1E1E1E] border border-[#2e2e2e] rounded-xl shadow-xl py-1 text-xs text-neutral-200">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleConcluded(post.id);
                    }}
                    className="w-full px-3 py-2 text-left text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{post.is_concluded ? 'I-balik Aktibo' : 'I-mark Human Na'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm('Sigurado ka nga papason kini nga post?')) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
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
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Author Avatar Badge */}
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              {post.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white truncate max-w-[150px] sm:max-w-xs">
                  {post.profile?.display_name || 'Marangog Baller'}
                </span>
                {/* Purok Badge (Electric Cyan Secondary Pop) */}
                <span className="text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/30 shrink-0">
                  {post.profile?.purok || 'Marangog'}
                </span>
              </div>
            </div>
          </div>

          {/* Court Name with Pin */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-[#121212] px-2 py-1 rounded-lg border border-[#2e2e2e] shrink-0 max-w-full sm:max-w-none truncate">
            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{post.court_name}</span>
          </div>
        </div>

        {/* Post Message Body */}
        <div className="text-white text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {post.message}
        </div>

        {/* Headcount Attendees Roster Preview if available */}
        {post.headcount_roster && post.headcount_roster.length > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#121212]/80 border border-[#2e2e2e] text-[11px] text-neutral-300">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-neutral-400 text-[10px]">Joined:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {post.headcount_roster.slice(0, 4).map((player, idx) => (
                <span 
                  key={player.id || idx}
                  className="bg-[#1E1E1E] border border-[#2e2e2e] px-1.5 py-0.5 rounded text-[10px] text-neutral-200"
                >
                  {player.display_name} <span className="text-cyan-400 text-[9px]">({player.purok})</span>
                </span>
              ))}
              {post.headcount_roster.length > 4 && (
                <span className="text-neutral-400 text-[10px]">
                  +{post.headcount_roster.length - 4} pa
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Interactive Action Buttons */}
        <div className="pt-2 border-t border-[#2e2e2e] flex items-center justify-between gap-2">
          {/* Join / Headcount Button */}
          <button
            onClick={handleHeadcountClick}
            disabled={post.is_concluded}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex-1 sm:flex-initial ${
              post.user_has_joined
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-200'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${post.user_has_joined ? 'text-cyan-400' : 'text-amber-500'}`} />
            <span>{post.user_has_joined ? 'Joined ✓' : 'Join'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#121212] border border-[#2e2e2e] text-neutral-300 font-semibold">
              {post.headcounts_count || 0}
            </span>
          </button>

          {/* Expand Comments ("Comment") Button */}
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 flex-1 sm:flex-initial"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {post.comments_count && post.comments_count > 0 
                ? `💬 ${post.comments_count} ${post.comments_count === 1 ? 'Comment' : 'Comments'}` 
                : 'Comment'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
