import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { mockEngine } from './lib/mockEngine';
import type { Post, Comment, Profile } from './types';
import { Header } from './components/Header';
import { CommunityNotice } from './components/CommunityNotice';
import { PostFeed } from './components/PostFeed';
import { CommentDrawer } from './components/CommentDrawer';
import { CreatePostDrawer } from './components/CreatePostDrawer';
import { AuthModal } from './components/AuthModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { BasketballIcon } from './components/BasketballIcon';
import { Plus } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, requireAuth, isSupabaseLive } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Drawers
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Fetch comments for a specific post
  const fetchCommentsForPost = useCallback(async (postId: string) => {
    if (isSupabaseLive) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            user_id,
            comment_text,
            created_at,
            profile:profiles (
              id,
              display_name,
              purok,
              monicker
            )
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching comments from Supabase:', error);
          return;
        }

        const mapped: Comment[] = (data || []).map((row: any) => ({
          id: row.id,
          post_id: row.post_id,
          user_id: row.user_id,
          comment_text: row.comment_text,
          created_at: row.created_at,
          profile: Array.isArray(row.profile) ? row.profile[0] : row.profile,
        }));
        setComments(mapped);
      } catch (err) {
        console.error('Comments fetch error:', err);
      }
    } else {
      const mockComments = mockEngine.getComments(postId);
      setComments(mockComments);
    }
  }, [isSupabaseLive]);

  // Fetch all posts with author profile and engagement counts
  const fetchPosts = useCallback(async () => {
    if (isSupabaseLive) {
      try {
        // Query posts from the last 12 hours onwards
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            category,
            court_name,
            message,
            players_needed,
            is_concluded,
            created_at,
            profile:profiles (
              id,
              display_name,
              purok,
              monicker
            )
          `)
          .gte('created_at', twelveHoursAgo)
          .order('created_at', { ascending: false });

        if (postsError) {
          console.error('Posts fetch error:', postsError);
          return;
        }

        // Fetch comments and headcounts to compute counts & rosters
        const { data: allComments } = await supabase
          .from('comments')
          .select('id, post_id');

        const { data: allHeadcounts } = await supabase
          .from('headcounts')
          .select(`
            id, 
            post_id, 
            user_id, 
            profile:profiles(id, display_name, purok, monicker)
          `);

        const formattedPosts: Post[] = (postsData || []).map((p: any) => {
          const postComments = (allComments || []).filter((c: any) => c.post_id === p.id);
          const postHeadcounts = (allHeadcounts || []).filter((h: any) => h.post_id === p.id);
          const userJoined = user ? postHeadcounts.some((h: any) => h.user_id === user.id) : false;
          const roster: Profile[] = postHeadcounts
            .map((h: any) => (Array.isArray(h.profile) ? h.profile[0] : h.profile))
            .filter((prof: any): prof is Profile => Boolean(prof));

          return {
            id: p.id,
            user_id: p.user_id,
            category: p.category,
            court_name: p.court_name,
            message: p.message,
            players_needed: p.players_needed,
            is_concluded: p.is_concluded,
            created_at: p.created_at,
            profile: Array.isArray(p.profile) ? p.profile[0] : p.profile,
            comments_count: postComments.length,
            headcounts_count: postHeadcounts.length,
            user_has_joined: userJoined,
            headcount_roster: roster,
          };
        });

        setPosts(formattedPosts);
      } catch (err) {
        console.error('Failed to load posts from Supabase:', err);
      }
    } else {
      const mockPosts = mockEngine.getPosts();
      setPosts(mockPosts);
    }
  }, [isSupabaseLive, user]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    setLoadingPosts(true);

    fetchPosts().finally(() => {
      if (mounted) setLoadingPosts(false);
    });

    return () => {
      mounted = false;
    };
  }, [fetchPosts]);

  // Real-time Subscriptions (Supabase Channel or Mock Engine)
  useEffect(() => {
    if (isSupabaseLive) {
      const postsChannel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchPosts();
        })
        .subscribe();

      const commentsChannel = supabase
        .channel('public:comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
          fetchPosts();
          if (selectedPost && (payload.new as any)?.post_id === selectedPost.id) {
            fetchCommentsForPost(selectedPost.id);
          }
        })
        .subscribe();

      const headcountsChannel = supabase
        .channel('public:headcounts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'headcounts' }, () => {
          fetchPosts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(postsChannel);
        supabase.removeChannel(commentsChannel);
        supabase.removeChannel(headcountsChannel);
      };
    } else {
      const unsubscribe = mockEngine.subscribe(() => {
        fetchPosts();
        if (selectedPost) {
          fetchCommentsForPost(selectedPost.id);
        }
      });
      return () => unsubscribe();
    }
  }, [isSupabaseLive, selectedPost, fetchPosts, fetchCommentsForPost]);

  // Manual pull-to-refresh / header refresh action
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    if (selectedPost) {
      await fetchCommentsForPost(selectedPost.id);
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Open Comments Drawer
  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    fetchCommentsForPost(post.id);
    setIsCommentDrawerOpen(true);
  };

  // Submit Comment
  const handleSubmitComment = async (postId: string, text: string) => {
    if (!user) return;

    if (isSupabaseLive) {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        comment_text: text,
      });

      if (error) {
        console.error('Error adding comment:', error);
        alert('Sayop sa pag-padala sa comment: ' + error.message);
        return;
      }
      await fetchCommentsForPost(postId);
      await fetchPosts();
    } else {
      mockEngine.createComment(postId, user.id, text);
      await fetchCommentsForPost(postId);
      await fetchPosts();
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    if (isSupabaseLive) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete comment error:', error);
        alert('Sayop sa pag-papas sa comment: ' + error.message);
        return;
      }
      if (selectedPost) {
        await fetchCommentsForPost(selectedPost.id);
      }
      await fetchPosts();
    } else {
      mockEngine.deleteComment(commentId);
      if (selectedPost) {
        await fetchCommentsForPost(selectedPost.id);
      }
      await fetchPosts();
    }
  };

  // Submit Post
  const handleSubmitPost = async (data: {
    category: any;
    court_name: string;
    message: string;
    players_needed: number;
  }) => {
    if (!user) return;

    if (isSupabaseLive) {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        category: data.category,
        court_name: data.court_name,
        message: data.message,
        players_needed: data.players_needed,
      });

      if (error) {
        console.error('Create post error:', error);
        throw new Error(error.message);
      }
      await fetchPosts();
    } else {
      mockEngine.createPost({
        user_id: user.id,
        category: data.category,
        court_name: data.court_name,
        message: data.message,
        players_needed: data.players_needed,
      });
      await fetchPosts();
    }
  };

  // Toggle Headcount ("Join")
  const handleToggleHeadcount = async (postId: string) => {
    if (!user) return;

    if (isSupabaseLive) {
      // Check if already in headcounts
      const { data: existing } = await supabase
        .from('headcounts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Leave headcount
        await supabase.from('headcounts').delete().eq('id', existing.id);
      } else {
        // Join headcount
        await supabase.from('headcounts').insert({
          post_id: postId,
          user_id: user.id,
        });
      }
      await fetchPosts();
    } else {
      mockEngine.toggleHeadcount(postId, user.id);
      await fetchPosts();
    }
  };

  // Toggle Concluded ("Human Na")
  const handleToggleConcluded = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (isSupabaseLive) {
      await supabase
        .from('posts')
        .update({ is_concluded: !post.is_concluded })
        .eq('id', postId)
        .eq('user_id', user.id);
      await fetchPosts();
    } else {
      mockEngine.togglePostConcluded(postId);
      await fetchPosts();
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    if (isSupabaseLive) {
      await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      await fetchPosts();
    } else {
      mockEngine.deletePost(postId);
      await fetchPosts();
    }
  };

  // Trigger Create Post Drawer with Auth Guard
  const handleOpenCreatePost = () => {
    requireAuth(() => {
      setIsCreateDrawerOpen(true);
    }, "Paghimo'g account o log in aron makapost ug duwa sa board!");
  };

  return (
    <div className="min-h-screen bg-white text-[#24282d] flex flex-col font-sans">
      {/* Top App Header */}
      <Header
        onRefreshFeed={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-24">
        {/* Barangay Notice Banner & Stats */}
        <CommunityNotice posts={posts} />

        {/* Real-time Game Feed */}
        <PostFeed
          posts={posts}
          loading={loadingPosts}
          onOpenComments={handleOpenComments}
          onToggleHeadcount={handleToggleHeadcount}
          onToggleConcluded={handleToggleConcluded}
          onDeletePost={handleDeletePost}
          onTriggerCreatePost={handleOpenCreatePost}
        />
      </main>

      {/* Floating Action Button (FAB) for Logged-in & Guest Players */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-8 z-30">
        <button
          onClick={handleOpenCreatePost}
          className="group flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#62babc] hover:bg-[#52a6a8] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-[#62babc]/30 active:scale-95 transition-all cursor-pointer"
          aria-label="Magduwa Ta - Create Post"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="tracking-wide flex items-center gap-1.5">
            <span>Maglima Ta!</span>
            <BasketballIcon className="w-4 h-4 text-white shrink-0" />
          </span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <CommentDrawer
        post={selectedPost}
        comments={comments}
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        onSubmitComment={handleSubmitComment}
        onDeleteComment={handleDeleteComment}
      />

      <CreatePostDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSubmitPost={handleSubmitPost}
      />

      <AuthModal />
      <ProfileSetupModal />
    </div>
  );
};

export default function App() {
  return (
    <AppContent />
  );
}
