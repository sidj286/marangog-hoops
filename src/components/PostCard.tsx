import React, { useState } from 'react';
import type { Post } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatTimeAgo } from '../lib/time';
import { CategoryIcon } from './CategoryIcon';
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
          colors: ['#45b2f0', '#807d7d', '#d2cbcb', '#eae6e6']
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
      className={`relative rounded-xl border transition-all duration-150 overflow-hidden shadow-xs ${
        post.is_concluded 
          ? 'border-[#d2cbcb] opacity-70 bg-[#eae6e6]' 
          : 'border-[#d2cbcb] hover:border-[#45b2f0] hover:shadow-md bg-white'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-2">
          {/* Category & Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${categoryMeta.badgeBg}`}
            >
              <CategoryIcon category={post.category} className="w-3.5 h-3.5 shrink-0" />
              <span>{categoryMeta.label}</span>
            </span>

            {post.is_concluded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eae6e6] text-[#807d7d] border border-[#d2cbcb]">
                <Check className="w-3 h-3 text-emerald-500" />
                Concluded
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#eae6e6] text-[#807d7d] border border-[#d2cbcb]">
              <Clock className="w-3 h-3 text-[#807d7d]" />
              {formatTimeAgo(post.created_at)}
            </span>

            {/* Players Needed badge */}
            {post.category === 'Need Player' && post.players_needed > 0 && !post.is_concluded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eae6e6] text-[#1e1c1c] border border-[#d2cbcb]">
                <span>Kulang:</span>
                <span className="bg-[#45b2f0] text-white px-1 rounded text-[10px] font-bold">
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
                className="p-1.5 text-[#807d7d] hover:text-[#1e1c1c] rounded-lg hover:bg-[#eae6e6] transition-colors"
                title="Share post"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>

              {isAuthor && (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-[#807d7d] hover:text-[#1e1c1c] rounded-lg hover:bg-[#eae6e6] transition-colors"
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
                <div className="absolute right-0 top-8 z-40 w-44 bg-white border border-[#d2cbcb] rounded-xl shadow-xl py-1 text-xs text-[#1e1c1c]">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleConcluded(post.id);
                    }}
                    className="w-full px-3 py-2 text-left text-[#1e1c1c] hover:bg-[#eae6e6] flex items-center gap-2"
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

        {/* Author & Court details */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Author Avatar Badge */}
            <div className="w-7 h-7 rounded-full bg-[#45b2f0]/15 border border-[#45b2f0]/30 text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0">
              {post.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[#1e1c1c] truncate max-w-[150px] sm:max-w-xs">
                  {post.profile?.display_name || 'Marangog Baller'}
                </span>
                {/* Purok Badge */}
                <span className="text-[10px] font-semibold bg-[#eae6e6] text-[#1e1c1c] px-1.5 py-0.2 rounded border border-[#d2cbcb] shrink-0">
                  {post.profile?.purok || 'Marangog'}
                </span>
              </div>
            </div>
          </div>

          {/* Court Name with Pin */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#807d7d] bg-[#eae6e6] px-2 py-1 rounded-lg border border-[#d2cbcb] shrink-0 max-w-full sm:max-w-none truncate">
            <MapPin className="w-3 h-3 text-[#45b2f0] shrink-0" />
            <span className="truncate">{post.court_name}</span>
          </div>
        </div>

        {/* Post Message Body */}
        <div className="text-[#1e1c1c] text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {post.message}
        </div>

        {/* Headcount Attendees Roster Preview if available */}
        {post.headcount_roster && post.headcount_roster.length > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#eae6e6] border border-[#d2cbcb] text-[11px] text-[#807d7d]">
            <UserCheck className="w-3.5 h-3.5 text-[#45b2f0] shrink-0" />
            <span className="text-[#807d7d] text-[10px]">Joined:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {post.headcount_roster.slice(0, 4).map((player, idx) => (
                <span 
                  key={player.id || idx}
                  className="bg-white border border-[#d2cbcb] px-1.5 py-0.5 rounded text-[10px] text-[#1e1c1c]"
                >
                  {player.display_name} <span className="text-[#45b2f0] text-[9px]">({player.purok})</span>
                </span>
              ))}
              {post.headcount_roster.length > 4 && (
                <span className="text-[#807d7d] text-[10px]">
                  +{post.headcount_roster.length - 4} pa
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Interactive Action Buttons */}
        <div className="pt-2 border-t border-[#d2cbcb] flex items-center justify-between gap-2">
          {/* Join / Headcount Button */}
          <button
            onClick={handleHeadcountClick}
            disabled={post.is_concluded}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex-1 sm:flex-initial ${
              post.user_has_joined
                ? 'bg-[#45b2f0] text-white border border-[#45b2f0]'
                : 'bg-[#eae6e6] hover:bg-[#d2cbcb] border border-[#d2cbcb] text-[#1e1c1c]'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${post.user_has_joined ? 'text-white' : 'text-[#45b2f0]'}`} />
            {post.user_has_joined ? (
              <span className="inline-flex items-center gap-1 text-white">
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </span>
            ) : (
              <span>Join</span>
            )}
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              post.user_has_joined 
                ? 'bg-white/20 text-white' 
                : 'bg-white border border-[#d2cbcb] text-[#1e1c1c]'
            }`}>
              {post.headcounts_count || 0}
            </span>
          </button>

          {/* Expand Comments ("Comment") Button */}
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-[#eae6e6] hover:bg-[#d2cbcb] text-[#1e1c1c] border border-[#d2cbcb] text-xs font-bold transition-all active:scale-95 flex-1 sm:flex-initial"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#45b2f0]" />
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
