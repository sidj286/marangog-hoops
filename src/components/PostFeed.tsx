import React, { useState, useMemo } from 'react';
import type { Post, PostCategory, Profile } from '../types';
import { CATEGORIES } from '../types';
import { PostCard } from './PostCard';
import { CategoryIcon } from './CategoryIcon';
import { BasketballIcon } from './BasketballIcon';
import { isPostExpired } from '../lib/time';
import { Search, Sparkles, User, Users } from 'lucide-react';

interface PostFeedProps {
  posts: Post[];
  loading: boolean;
  allProfiles?: Profile[];
  onOpenComments: (post: Post) => void;
  onToggleHeadcount: (postId: string) => void;
  onToggleConcluded: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onTriggerCreatePost: () => void;
  onSelectPlayer?: (player: Profile) => void;
  onOpenPlayersDirectory?: () => void;
}

export const PostFeed: React.FC<PostFeedProps> = ({
  posts,
  loading,
  allProfiles = [],
  onOpenComments,
  onToggleHeadcount,
  onToggleConcluded,
  onDeletePost,
  onTriggerCreatePost,
  onSelectPlayer,
  onOpenPlayersDirectory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Players matching the search query across profiles and posts
  const matchingPlayers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const profileMap = new Map<string, Profile>();
    allProfiles.forEach((p) => {
      if (p && p.id) profileMap.set(p.id, p);
    });
    posts.forEach((p) => {
      if (p.profile && p.profile.id) {
        profileMap.set(p.profile.id, p.profile);
      }
      if (p.headcount_roster) {
        p.headcount_roster.forEach((r) => {
          if (r && r.id) profileMap.set(r.id, r);
        });
      }
    });

    return Array.from(profileMap.values()).filter((player) => {
      const name = player.display_name?.toLowerCase() || '';
      const purok = player.purok?.toLowerCase() || '';
      const monicker = player.monicker?.toLowerCase() || '';
      return name.includes(q) || purok.includes(q) || monicker.includes(q);
    });
  }, [allProfiles, posts, searchQuery]);

  // 12-Hour Expiration Filtering + Category & Search Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Auto-expire posts older than 12 hours
      if (isPostExpired(post.created_at)) {
        return false;
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
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-3.5">
      {/* Category Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {/* Tanan Filter Tab */}
          {(() => {
            const allActiveCount = posts.filter(p => !isPostExpired(p.created_at) && !p.is_concluded).length;
            return (
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BasketballIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Tanan posts</span>
                {allActiveCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1.5 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full shadow-xs leading-none">
                    {allActiveCount}
                  </span>
                )}
              </button>
            );
          })()}

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
                    ? 'bg-white border-2 border-[#06B6D4] text-[#06B6D4] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CategoryIcon category={catKey} className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1.5 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full shadow-xs leading-none">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar & 'See also who is here' option */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pangitaa ang Court, Purok, o Magduduwa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-700 text-xs p-0.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Option: See also who is here button */}
          {onOpenPlayersDirectory && (
            <button
              type="button"
              onClick={onOpenPlayersDirectory}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#06B6D4] text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
              title="View all players with a registered account"
            >
              <Users className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
              <span className="hidden sm:inline">See also who is here</span>
              <span className="sm:hidden">Who is here</span>
              {allProfiles.length > 0 && (
                <span className="text-[10px] bg-cyan-50 text-cyan-800 px-1.5 py-0.2 rounded font-extrabold border border-cyan-200">
                  {allProfiles.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Matching Players Result Strip */}
        {searchQuery.trim() && matchingPlayers.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <User className="w-3 h-3 text-[#F59E0B]" />
                Nakit-an nga Magduduwa ({matchingPlayers.length})
              </span>
              <span className="text-[10px] text-slate-500 font-medium">I-click aron makita ang profile</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchingPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => onSelectPlayer?.(player)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-amber-100/50 border border-amber-200 rounded-lg text-xs text-slate-800 font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                  title="Tan-awa ang Full Name ug Purok"
                >
                  <span className="text-slate-900 font-bold">{player.display_name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                    {player.purok}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#F59E0B] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Gikuha ang real-time court updates sa Marangog...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center mx-auto">
            <BasketballIcon className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Walay aktibong duwa sa board karon.
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Ang mga post awtomatikong mo-expire human sa 12 ka oras. Mahimo kang mag-post karon aron magka-tapok ang mga magduduwa!
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerCreatePost}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold text-xs rounded-lg shadow-sm shadow-[#F59E0B]/25 active:scale-95 transition-all"
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
              players={allProfiles}
              onOpenComments={onOpenComments}
              onToggleHeadcount={onToggleHeadcount}
              onToggleConcluded={onToggleConcluded}
              onDeletePost={onDeletePost}
              onSelectPlayer={onSelectPlayer}
            />
          ))}
        </div>
      )}
    </div>
  );
};
