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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 text-stone-900">
        {/* Top Handle for mobile */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-[#FAF7F5] border-b border-stone-100">
          <div className="w-10 h-1 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-[#f8c2ac]/40 bg-[#FAF7F5] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md border font-bold ${categoryMeta.badgeBg}`}>
                <CategoryIcon category={post.category} className="w-3.5 h-3.5" />
                <span>{categoryMeta.label}</span>
              </span>
              <span className="text-stone-500 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#ee6730]" />
                {post.court_name}
              </span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 truncate">
              "{post.message}"
            </h3>
            <p className="text-[11px] text-stone-500">
              Gipost ni <span className="text-stone-800 font-semibold">{post.profile?.display_name}</span> ({post.profile?.purok})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] bg-white">
          {comments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#fce1d6] border border-[#f8c2ac] text-[#ee6730] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-[#ee6730]" />
              </div>
              <p className="text-sm font-bold text-stone-800">Wala pa'y comment sa kini nga duwa.</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
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
                      ? 'bg-[#fce1d6]/40 border-[#f8c2ac] ml-4'
                      : 'bg-[#FAF7F5] border-stone-200 mr-4'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#fce1d6] border border-[#f8c2ac] text-[#ee6730] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {comment.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                  </div>

                  {/* Comment Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-stone-900">
                          {comment.profile?.display_name || 'Marangog Baller'}
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                          {comment.profile?.purok || 'Marangog'}
                        </span>
                      </div>

                      <span className="text-[10px] text-stone-400 shrink-0">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed font-normal">
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
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors self-center shrink-0"
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
        <div className="px-4 py-2 border-t border-[#f8c2ac]/30 bg-[#FAF7F5] overflow-x-auto flex gap-1.5 no-scrollbar">
          {QUICK_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-[#fce1d6]/60 border border-stone-200 text-stone-700 hover:text-stone-900 px-2.5 py-1 rounded-full transition-all active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Comment Input Footer / Auth Banner */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
          {isGuest ? (
            <div className="p-3 rounded-xl bg-[#fce1d6]/50 border border-[#f8c2ac] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#ee6730]/15 text-[#ee6730] border border-[#ee6730]/30 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 leading-tight truncate">
                    Bisita Mode (Read-Only)
                  </p>
                  <p className="text-[10px] text-stone-600 leading-tight truncate">
                    Log in o Sign up aron maka-reply sa court chat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => requireAuth(() => {}, "Paghimo'g account o log in aron maka-comment sa duwa!")}
                className="px-3 py-2 bg-[#ee6730] hover:bg-[#d85620] text-white font-bold rounded-lg text-xs shadow-sm shadow-[#ee6730]/20 active:scale-95 transition-all shrink-0"
              >
                Sulod / Sign Up
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
                  className="w-full bg-[#FAF7F5] border border-stone-200 rounded-lg py-2 pl-3.5 pr-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ee6730] focus:ring-1 focus:ring-[#ee6730] text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="p-2.5 bg-[#ee6730] hover:bg-[#d85620] disabled:opacity-40 text-white rounded-lg shadow-sm shadow-[#ee6730]/20 active:scale-95 transition-all shrink-0"
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
