import React, { useState, useEffect, useRef } from 'react';
import type { Post, Comment, Profile } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../lib/time';
import { CategoryIcon } from './CategoryIcon';
import { MentionText } from './MentionText';
import { MentionSuggestions } from './MentionSuggestions';
import { 
  X, 
  Send, 
  Trash2, 
  Lock, 
  MapPin,
  MessageSquare,
  AtSign
} from 'lucide-react';

interface CommentDrawerProps {
  post: Post | null;
  comments: Comment[];
  isOpen: boolean;
  players?: Profile[];
  onClose: () => void;
  onSubmitComment: (postId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onSelectPlayer?: (player: Profile) => void;
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
  players = [],
  onClose,
  onSubmitComment,
  onDeleteComment,
  onSelectPlayer,
}) => {
  const { user, profile, isGuest, requireAuth } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentText(val);

    const selStart = e.target.selectionStart || val.length;
    const textBefore = val.slice(0, selStart);
    const lastAt = textBefore.lastIndexOf('@');

    if (lastAt !== -1) {
      const query = textBefore.slice(lastAt + 1);
      if (!query.includes('  ')) {
        setMentionQuery(query);
        setShowMentionPicker(true);
        return;
      }
    }

    if (showMentionPicker && !mentionQuery) {
      setShowMentionPicker(false);
    }
  };

  const handleSelectMention = (player: Profile) => {
    const input = inputRef.current;
    const tag = `@${player.display_name} `;

    if (input) {
      const selStart = input.selectionStart || commentText.length;
      const textBefore = commentText.slice(0, selStart);
      const lastAt = textBefore.lastIndexOf('@');

      if (lastAt !== -1) {
        const newText = commentText.slice(0, lastAt) + tag + commentText.slice(selStart);
        setCommentText(newText);
      } else {
        const sep = commentText && !commentText.endsWith(' ') ? ' ' : '';
        setCommentText(commentText + sep + tag);
      }
    } else {
      const sep = commentText && !commentText.endsWith(' ') ? ' ' : '';
      setCommentText(commentText + sep + tag);
    }

    setShowMentionPicker(false);
    setMentionQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    requireAuth(async () => {
      setSubmitting(true);
      try {
        await onSubmitComment(post.id, commentText.trim());
        setCommentText('');
        setShowMentionPicker(false);
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

      <div className="relative w-full max-w-md sm:max-w-lg bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 text-slate-900">
        {/* Top Handle for mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 bg-slate-50 border-b border-slate-200">
          <div className="w-8 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs px-2 py-0.5 rounded-md border font-bold ${categoryMeta.badgeBg}`}>
                <CategoryIcon category={post.category} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{categoryMeta.label}</span>
              </span>
              <span className="text-slate-600 text-[11px] sm:text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#06B6D4]" />
                <span className="text-[10px] font-bold text-slate-500">Basket Ball Court:</span>
                <span className="font-semibold text-slate-900">{post.court_name}</span>
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
              "<MentionText text={post.message} players={players} onSelectPlayer={onSelectPlayer} />"
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              Gipost ni <span className="text-slate-900 font-semibold">{post.profile?.display_name}</span> ({post.profile?.purok})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Comments Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] bg-white">
          {comments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-[#06B6D4]" />
              </div>
              <p className="text-sm font-bold text-slate-900">Wala pa'y comment sa kini nga duwa.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
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
                      ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30 ml-4'
                      : 'bg-slate-50 border-slate-200 mr-4'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => comment.profile && onSelectPlayer?.(comment.profile)}
                          className="text-xs font-bold text-slate-900 hover:text-[#D97706] hover:underline transition-colors text-left cursor-pointer"
                          title="Tan-awa ang Profile sa Player"
                        >
                          {comment.profile?.display_name || 'Marangog Baller'}
                        </button>
                        <button
                          type="button"
                          onClick={() => comment.profile && onSelectPlayer?.(comment.profile)}
                          className="text-[10px] font-bold bg-white hover:bg-cyan-50 text-[#06B6D4] px-1.5 py-0.2 rounded border border-slate-200 transition-colors cursor-pointer"
                          title="Purok sa Player"
                        >
                          {comment.profile?.purok || 'Marangog'}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                      <MentionText text={comment.comment_text} players={players} onSelectPlayer={onSelectPlayer} />
                    </div>
                  </div>

                  {/* Delete Button (if author) */}
                  {isCommentAuthor && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this comment?')) {
                          onDeleteComment(comment.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors self-center shrink-0"
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
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 overflow-x-auto flex gap-1.5 no-scrollbar">
          {QUICK_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-full transition-all active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Comment Input Footer / Auth Banner */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          {isGuest ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white text-[#F59E0B] border border-slate-200 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                    Bisita Mode (Read-Only)
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight truncate">
                    Log in o Sign up aron maka-reply sa court chat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => requireAuth(() => {}, "Paghimo'g account o log in aron maka-comment sa duwa!")}
                className="px-3 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold rounded-lg text-xs shadow-sm shadow-[#F59E0B]/25 active:scale-95 transition-all shrink-0"
              >
                Sign in / Sign Up
              </button>
            </div>
          ) : (
            <div className="relative">
              {showMentionPicker && (
                <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
                  <MentionSuggestions
                    players={players}
                    filterQuery={mentionQuery}
                    onSelect={handleSelectMention}
                    onClose={() => {
                      setShowMentionPicker(false);
                      setMentionQuery('');
                    }}
                    title="I-mention sa Comment"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMentionPicker((prev) => !prev);
                    setMentionQuery('');
                  }}
                  className="p-2 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-[#D97706] hover:border-amber-300 transition-colors shrink-0 cursor-pointer"
                  title="I-mention ang Player (@)"
                  aria-label="Mention a player"
                >
                  <AtSign className="w-4 h-4" />
                </button>

                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Comment isip ${profile?.display_name || 'Player'} (@ aron mag-tag)...`}
                    value={commentText}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="p-2.5 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 text-black font-bold rounded-lg shadow-sm shadow-[#F59E0B]/25 active:scale-95 transition-all shrink-0 cursor-pointer"
                  aria-label="Send comment"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-black" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
