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
      className={`relative bg-white rounded-xl border transition-all duration-150 overflow-hidden shadow-xs ${
        post.is_concluded 
          ? 'border-stone-200 opacity-70 bg-stone-50' 
          : 'border-[#f8c2ac]/40 hover:border-[#f18559]/60 hover:shadow-md'
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Human Na
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FAF7F5] text-stone-500 border border-[#f8c2ac]/40">
              <Clock className="w-3 h-3 text-stone-400" />
              {formatTimeAgo(post.created_at)}
            </span>

            {/* Players Needed badge */}
            {post.category === 'Need Player' && post.players_needed > 0 && !post.is_concluded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span>Kulang:</span>
                <span className="bg-blue-600 text-white px-1 rounded text-[10px] font-bold">
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
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                title="Share post"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              {isAuthor && (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
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
                <div className="absolute right-0 top-8 z-40 w-44 bg-white border border-stone-200 rounded-xl shadow-xl py-1 text-xs text-stone-700">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleConcluded(post.id);
                    }}
                    className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{post.is_concluded ? 'I-balik Aktibo' : 'I-mark Human Na'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm('Sigurado ka nga papason kini nga post?')) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
            <div className="w-7 h-7 rounded-full bg-[#fce1d6] border border-[#f8c2ac] text-[#ee6730] flex items-center justify-center font-bold text-xs shrink-0">
              {post.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-stone-900 truncate max-w-[150px] sm:max-w-xs">
                  {post.profile?.display_name || 'Marangog Baller'}
                </span>
                {/* Purok Badge (Emerald Verified Accent) */}
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                  {post.profile?.purok || 'Marangog'}
                </span>
              </div>
            </div>
          </div>

          {/* Court Name with Pin */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-[#fce1d6]/60 px-2 py-1 rounded-lg border border-[#f8c2ac]/60 shrink-0 max-w-full sm:max-w-none truncate">
            <MapPin className="w-3 h-3 text-[#ee6730] shrink-0" />
            <span className="truncate">{post.court_name}</span>
          </div>
        </div>

        {/* Post Message Body */}
        <div className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {post.message}
        </div>

        {/* Headcount Attendees Roster Preview if available */}
        {post.headcount_roster && post.headcount_roster.length > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#FAF7F5] border border-[#f8c2ac]/40 text-[11px] text-stone-700">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-stone-400 text-[10px]">Joined:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {post.headcount_roster.slice(0, 4).map((player, idx) => (
                <span 
                  key={player.id || idx}
                  className="bg-white border border-stone-200 px-1.5 py-0.5 rounded text-[10px] text-stone-800"
                >
                  {player.display_name} <span className="text-[#ee6730] text-[9px]">({player.purok})</span>
                </span>
              ))}
              {post.headcount_roster.length > 4 && (
                <span className="text-stone-400 text-[10px]">
                  +{post.headcount_roster.length - 4} pa
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Interactive Action Buttons */}
        <div className="pt-2 border-t border-[#f8c2ac]/30 flex items-center justify-between gap-2">
          {/* Join / Headcount Button */}
          <button
            onClick={handleHeadcountClick}
            disabled={post.is_concluded}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex-1 sm:flex-initial ${
              post.user_has_joined
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-[#FAF7F5] hover:bg-[#fce1d6]/50 border border-stone-200 text-stone-700'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${post.user_has_joined ? 'text-emerald-600' : 'text-[#ee6730]'}`} />
            <span>{post.user_has_joined ? 'Joined ✓' : 'Join'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-stone-200 text-stone-700 font-semibold">
              {post.headcounts_count || 0}
            </span>
          </button>

          {/* Expand Comments ("Comment") Button */}
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-[#fce1d6] hover:bg-[#f8c2ac]/60 text-[#ee6730] border border-[#f8c2ac] text-xs font-bold transition-all active:scale-95 flex-1 sm:flex-initial"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#ee6730]" />
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
