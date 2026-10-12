import React, { useState, useEffect, useRef } from 'react';
import type { Post, Comment } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../lib/time';
import { CategoryIcon } from './CategoryIcon';
import { 
  X, 
  Send, 
  Trash2, 
  Lock, 
  MapPin,
  MessageSquare 
} from 'lucide-react';

interface CommentDrawerProps {
  post: Post | null;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitComment: (postId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

const QUICK_RESPONSES = [
  'Padung nako!',
  'Mo-apas ko after trabaho',
  'Dala kog bola!',
  'Naa nay referee?',
  'Kinsa inyong manong?'
];

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  post,
  comments,
  isOpen,
  onClose,
  onSubmitComment,
  onDeleteComment,
}) => {
  const { user, profile, isGuest, requireAuth } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (!isGuest) {
          inputRef.current?.focus();
        }
      }, 200);
    }
  }, [isOpen, comments.length, isGuest]);

  if (!isOpen || !post) return null;

  const categoryMeta = CATEGORIES[post.category] || CATEGORIES['Magduwa Hapon'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    requireAuth(async () => {
      setSubmitting(true);
      try {
        await onSubmitComment(post.id, commentText.trim());
        setCommentText('');
      } finally {
        setSubmitting(false);
      }
    }, "Paghimo'g account o log in aron maka-comment!");
  };

  const handleQuickChip = (text: string) => {
    requireAuth(async () => {
      setSubmitting(true);
      try {
        await onSubmitComment(post.id, text);
      } finally {
        setSubmitting(false);
      }
    }, "Paghimo'g account o log in aron maka-comment!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-white border border-[#d2cbcb] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 text-[#1e1c1c]">
        {/* Top Handle for mobile */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-[#eae6e6] border-b border-[#d2cbcb]">
          <div className="w-10 h-1 rounded-full bg-[#ada8a8]" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-[#d2cbcb] bg-[#eae6e6] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md border font-bold ${categoryMeta.badgeBg}`}>
                <CategoryIcon category={post.category} className="w-3.5 h-3.5" />
                <span>{categoryMeta.label}</span>
              </span>
              <span className="text-[#807d7d] text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#45b2f0]" />
                {post.court_name}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1e1c1c] truncate">
              "{post.message}"
            </h3>
            <p className="text-[11px] text-[#807d7d]">
              Gipost ni <span className="text-[#1e1c1c] font-semibold">{post.profile?.display_name}</span> ({post.profile?.purok})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#807d7d] hover:text-[#1e1c1c] bg-white hover:bg-[#eae6e6] border border-[#d2cbcb] transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] bg-white">
          {comments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#eae6e6] border border-[#d2cbcb] text-[#45b2f0] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-[#45b2f0]" />
              </div>
              <p className="text-sm font-bold text-[#1e1c1c]">Wala pa'y comment sa kini nga duwa.</p>
              <p className="text-xs text-[#807d7d] max-w-xs mx-auto">
                Mahimong una nga mo-comment! Isulti kung padung naka o magdala ug bola.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCommentAuthor = user?.id === comment.user_id;

              return (
                <div
                  key={comment.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                    isCommentAuthor
                      ? 'bg-[#45b2f0]/10 border-[#45b2f0]/30 ml-4'
                      : 'bg-[#eae6e6] border-[#d2cbcb] mr-4'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#45b2f0]/15 border border-[#45b2f0]/30 text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {comment.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                  </div>

                  {/* Comment Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#1e1c1c]">
                          {comment.profile?.display_name || 'Marangog Baller'}
                        </span>
                        <span className="text-[10px] font-semibold bg-white text-[#1e1c1c] px-1.5 py-0.2 rounded border border-[#d2cbcb]">
                          {comment.profile?.purok || 'Marangog'}
                        </span>
                      </div>

                      <span className="text-[10px] text-[#807d7d] shrink-0">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-[#1e1c1c] whitespace-pre-wrap leading-relaxed font-normal">
                      {comment.comment_text}
                    </p>
                  </div>

                  {/* Delete Button (if author) */}
                  {isCommentAuthor && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this comment?')) {
                          onDeleteComment(comment.id);
                        }
                      }}
                      className="p-1 text-[#807d7d] hover:text-rose-500 rounded transition-colors self-center shrink-0"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Response Chips */}
        <div className="px-4 py-2 border-t border-[#d2cbcb] bg-[#eae6e6] overflow-x-auto flex gap-1.5 no-scrollbar">
          {QUICK_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-[#eae6e6] border border-[#d2cbcb] text-[#807d7d] hover:text-[#1e1c1c] px-2.5 py-1 rounded-full transition-all active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Comment Input Footer / Auth Banner */}
        <div className="p-3 sm:p-4 border-t border-[#d2cbcb] bg-white">
          {isGuest ? (
            <div className="p-3 rounded-xl bg-[#eae6e6] border border-[#d2cbcb] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white text-[#45b2f0] border border-[#d2cbcb] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1e1c1c] leading-tight truncate">
                    Bisita Mode (Read-Only)
                  </p>
                  <p className="text-[10px] text-[#807d7d] leading-tight truncate">
                    Log in o Sign up aron maka-reply sa court chat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => requireAuth(() => {}, "Paghimo'g account o log in aron maka-comment sa duwa!")}
                className="px-3 py-2 bg-[#45b2f0] hover:bg-[#32a1e0] text-white font-bold rounded-lg text-xs shadow-sm shadow-[#45b2f0]/25 active:scale-95 transition-all shrink-0"
              >
                Sign in / Sign Up
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Comment isip ${profile?.display_name} (${profile?.purok})...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-[#eae6e6] focus:bg-white border border-[#d2cbcb] rounded-lg py-2 pl-3.5 pr-3 text-[#1e1c1c] placeholder:text-[#807d7d] focus:outline-none focus:border-[#45b2f0] focus:ring-1 focus:ring-[#45b2f0] text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="p-2.5 bg-[#45b2f0] hover:bg-[#32a1e0] disabled:opacity-40 text-white rounded-lg shadow-sm shadow-[#45b2f0]/25 active:scale-95 transition-all shrink-0"
                aria-label="Send comment"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
