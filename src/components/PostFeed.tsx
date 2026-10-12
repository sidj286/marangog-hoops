import React, { useState, useMemo } from 'react';
import type { Post, PostCategory } from '../types';
import { CATEGORIES } from '../types';
import { PostCard } from './PostCard';
import { CategoryIcon } from './CategoryIcon';
import { BasketballIcon } from './BasketballIcon';
import { isPostExpired } from '../lib/time';
import { Search, Clock, Sparkles } from 'lucide-react';

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
  const [showOnlyActive, setShowOnlyActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 12-Hour Expiration Filtering + Category & Search Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const expired = isPostExpired(post.created_at);
      if (showOnlyActive) {
        if (expired) return false;
        if (post.is_concluded) return false;
      }

      if (selectedCategory !== 'ALL' && post.category !== selectedCategory) {
        return false;
      }

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
    <div className="space-y-3.5">
      {/* Category Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-[#ee6730] text-white shadow-sm shadow-[#ee6730]/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-[#fce1d6]/50'
            }`}
          >
            <BasketballIcon className="w-3.5 h-3.5 shrink-0" />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#fce1d6] border-[#ee6730] text-[#ee6730]'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-[#fce1d6]/50'
                }`}
              >
                <CategoryIcon category={catKey} className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FAF7F5] text-stone-600 border border-stone-200">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Active 12h Toggle Strip */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pangitaa ang Court, Purok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ee6730] focus:ring-1 focus:ring-[#ee6730] truncate"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-stone-400 hover:text-stone-700 text-xs p-0.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Active 12-Hour vs All Toggle */}
          <button
            type="button"
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border flex items-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors shrink-0 ${
              showOnlyActive
                ? 'bg-[#fce1d6] border-[#f8c2ac] text-[#ee6730]'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-3 h-3 text-[#ee6730] shrink-0" />
            <span>{showOnlyActive ? 'Aktibo (<12h)' : 'Apil Human Na'}</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-[#ee6730] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Gikuha ang real-time court updates sa Marangog...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-12 px-4 text-center bg-white rounded-2xl border border-[#f8c2ac]/40 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#fce1d6] text-[#ee6730] border border-[#f8c2ac] flex items-center justify-center mx-auto">
            <BasketballIcon className="w-6 h-6 text-[#ee6730]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              {showOnlyActive 
                ? 'Walay aktibong duwa sa board karon.' 
                : 'Walay nakit-an nga post.'}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Ang mga post awtomatikong mo-expire human sa 12 ka oras. Mahimo kang mag-post karon aron magka-tapok ang mga magduduwa!
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerCreatePost}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ee6730] hover:bg-[#d85620] text-white font-bold text-xs rounded-lg shadow-sm shadow-[#ee6730]/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pag-post ug Bag-ong Duwa</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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
