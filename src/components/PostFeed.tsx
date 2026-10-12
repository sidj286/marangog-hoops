import React, { useState, useMemo } from 'react';
import type { Post, PostCategory } from '../types';
import { CATEGORIES } from '../types';
import { PostCard } from './PostCard';
import { isPostExpired } from '../lib/time';
import { 
  Search, 
  Clock, 
  Flame, 
  Sparkles 
} from 'lucide-react';

interface PostFeedProps {
  posts: Post[];
  loading: boolean;
  onOpenComments: (post: Post) => void;
  onToggleHeadcount: (postId: string) => void;
  onToggleConcluded: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onTriggerCreatePost: () => void;
}

export const PostFeed: React.FC<PostFeedProps> = ({
  posts,
  loading,
  onOpenComments,
  onToggleHeadcount,
  onToggleConcluded,
  onDeletePost,
  onTriggerCreatePost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [showOnlyActive, setShowOnlyActive] = useState<boolean>(true); // Enforce 12h active feed by default
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 12-Hour Expiration Filtering + Category & Search Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Expiration filter
      const expired = isPostExpired(post.created_at);
      if (showOnlyActive) {
        if (expired) return false;
        if (post.is_concluded) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'ALL' && post.category !== selectedCategory) {
        return false;
      }

      // 3. Search filter (Court name, Purok, Message, Player name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCourt = post.court_name.toLowerCase().includes(q);
        const matchesMsg = post.message.toLowerCase().includes(q);
        const matchesName = post.profile?.display_name.toLowerCase().includes(q);
        const matchesPurok = post.profile?.purok.toLowerCase().includes(q);
        if (!matchesCourt && !matchesMsg && !matchesName && !matchesPurok) {
          return false;
        }
      }

      return true;
    });
  }, [posts, selectedCategory, showOnlyActive, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Category Pills Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Tanan ({posts.filter(p => !isPostExpired(p.created_at) && !p.is_concluded).length})</span>
          </button>

          {(Object.keys(CATEGORIES) as PostCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isSelected = selectedCategory === catKey;
            const count = posts.filter(p => p.category === catKey && !isPostExpired(p.created_at) && !p.is_concluded).length;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? `${cat.badgeBg} font-extrabold shadow-sm`
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Search Strip */}
        <div className="flex items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pangitaa ang Court, Purok, o Player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Active 12-Hour vs All Toggle */}
          <button
            type="button"
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              showOnlyActive
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{showOnlyActive ? 'Aktibo (<12h)' : 'Apil Human Na'}</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-court">Gikuha ang real-time court feed sa Marangog...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-14 px-4 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
            🏀
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-court">
              {showOnlyActive 
                ? 'Walay aktibong duwa sa feed karong panahona.' 
                : 'Walay nakit-an nga post.'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Ang mga post awtomatikong mo-expire human sa 12 ka oras. Mahimo kang mag-post karon aron magka-tapok ang mga magduduwa!
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerCreatePost}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all font-court"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pag-post ug Bag-ong Duwa 🏀</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={onOpenComments}
              onToggleHeadcount={onToggleHeadcount}
              onToggleConcluded={onToggleConcluded}
              onDeletePost={onDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};
