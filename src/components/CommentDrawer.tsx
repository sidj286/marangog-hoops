import React, { useState, useEffect, useRef } from 'react';
import type { Post, Comment } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../lib/time';
import { 
  X, 
  Send, 
  Trash2, 
  Lock, 
  MapPin 
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
  'Padung nako! 🏃‍♂️',
  'Mo-apas ko after trabaho ⏰',
  'Dala kog bola! 🏀',
  'Naa nay referee? ⚖️',
  'Kinsa inyong manong? ⚔️'
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
    }, "Paghimo'g account o log in aron makatubag sa comments!");
  };

  const handleQuickChip = (text: string) => {
    requireAuth(async () => {
      setSubmitting(true);
      try {
        await onSubmitComment(post.id, text);
      } finally {
        setSubmitting(false);
      }
    }, "Paghimo'g account o log in aron makatubag sa comments!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10">
        {/* Top Handle for mobile gestures */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${categoryMeta.badgeBg}`}>
                {categoryMeta.emoji} {categoryMeta.label}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-400" />
                {post.court_name}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white truncate line-clamp-1">
              "{post.message}"
            </h3>
            <p className="text-[11px] text-slate-400">
              Gipost ni <span className="text-slate-200 font-semibold">{post.profile?.display_name}</span> ({post.profile?.purok})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {comments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto text-xl">
                💬
              </div>
              <p className="text-sm font-bold text-slate-300 font-court">Wala pa'y tubag sa kini nga duwa.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Mahimong una nga motubag! Isulti kung padung naka o magdala ug bola.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCommentAuthor = user?.id === comment.user_id;

              return (
                <div
                  key={comment.id}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all ${
                    isCommentAuthor
                      ? 'bg-orange-950/20 border-orange-900/40 ml-4'
                      : 'bg-slate-950/70 border-slate-800 mr-4'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {comment.profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                  </div>

                  {/* Comment Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-200">
                          {comment.profile?.display_name || 'Marangog Baller'}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-800 text-orange-300 px-1.5 py-0.2 rounded border border-slate-700">
                          {comment.profile?.purok || 'Marangog'}
                        </span>
                        {comment.profile?.monicker && (
                          <span className="text-[9px] text-slate-400 italic">
                            "{comment.profile.monicker}"
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed font-normal">
                      {comment.comment_text}
                    </p>
                  </div>

                  {/* Delete Button (if author) */}
                  {isCommentAuthor && (
                    <button
                      onClick={() => {
                        if (confirm('Sigurado ka nga papason kini nga tubag?')) {
                          onDeleteComment(comment.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors self-center shrink-0"
                      title="Papasa ang tubag"
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

        {/* Quick Response Chips (Available to all, auth-guarded on tap) */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 overflow-x-auto flex gap-1.5 no-scrollbar">
          {QUICK_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-white px-2.5 py-1 rounded-full transition-all active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Comment Input Footer / Auth Banner */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950">
          {isGuest ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">
                    Bisita Mode (Read-Only)
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate">
                    Log in o Sign up aron maka-reply sa court chat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => requireAuth(() => {}, "Paghimo'g account o log in aron makatubag sa duwa!")}
                className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all shrink-0 font-court"
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
                  placeholder={`Tubag isip ${profile?.display_name} (${profile?.purok})...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3.5 pr-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all shrink-0"
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
