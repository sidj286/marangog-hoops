import type { Post, Comment, Profile, Headcount } from '../types';

const STORAGE_KEY_POSTS = 'marangog_mock_posts';
const STORAGE_KEY_COMMENTS = 'marangog_mock_comments';
const STORAGE_KEY_HEADCOUNTS = 'marangog_mock_headcounts';
const STORAGE_KEY_PROFILES = 'marangog_mock_profiles';
const STORAGE_KEY_CURRENT_USER = 'marangog_mock_current_user';

// Initial authentic mock profiles for Barangay Marangog, Bogo City
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-mark-123',
    display_name: 'Mark Anthony Rosales',
    purok: 'Purok 3',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'user-christian-456',
    display_name: 'Christian Jay Mendoza',
    purok: 'Sitio Ilaya',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'user-arnel-789',
    display_name: 'Arnel Fernandez',
    purok: 'Purok 2',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'user-jeric-101',
    display_name: 'Jeric Dela Peña',
    purok: 'Purok 1',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Initial authentic posts within 12 hours
const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    user_id: 'user-mark-123',
    category: 'Magduwa Hapon',
    court_name: 'Marangog Main Court',
    message: 'Abot ta ninyo mga 4:30 PM! Dala lang mo ug bola ug bugnaw nga tubig. Naay 3 ka team nag sabot.',
    players_needed: 0,
    is_concluded: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
  },
  {
    id: 'post-2',
    user_id: 'user-christian-456',
    category: 'Naa Nanulong',
    court_name: 'Sitio Ilaya Covered Court',
    message: 'Naay grupo gikan San Roque nanulong! 5v5 daw pustaanay ug softdrinks o dula-dula lang. Kinsa puyde mag-lineup karong 5 PM?',
    players_needed: 2,
    is_concluded: false,
    created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(), // ~1.8h ago
  },
  {
    id: 'post-3',
    user_id: 'user-jeric-101',
    category: 'Need Player',
    court_name: 'Marangog Main Court',
    message: 'Kulang 1 para 4v4 half-court! Duwa nata dayon, naa nay bola ug referee. Kinsa puyde mosalida?',
    players_needed: 1,
    is_concluded: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25m ago
  },
  {
    id: 'post-4',
    user_id: 'user-arnel-789',
    category: 'Manong sa Court',
    court_name: 'Marangog Main Court',
    message: 'Team Purok 2 daog 2 games straight. Team Ilaya sunod mosulod! Pag-lista na daan sa inyong rotation aron hapsay.',
    players_needed: 0,
    is_concluded: false,
    created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(), // ~3.5h ago
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    post_id: 'post-1',
    user_id: 'user-christian-456',
    comment_text: 'Padung nako bai, dala kog Molten GG7X!',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'comm-2',
    post_id: 'post-1',
    user_id: 'user-arnel-789',
    comment_text: 'Mo-apas ko around 5 PM human sa trabaho sa Purok 2.',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'comm-3',
    post_id: 'post-2',
    user_id: 'user-mark-123',
    comment_text: 'Salida ko ana bai Christian! Andama ang softdrinks!',
    created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    id: 'comm-4',
    post_id: 'post-3',
    user_id: 'user-christian-456',
    comment_text: 'Naa koy kauban padung diha, 5 mins na lang!',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  }
];

const INITIAL_HEADCOUNTS: Headcount[] = [
  {
    id: 'head-1',
    post_id: 'post-1',
    user_id: 'user-christian-456',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 'head-2',
    post_id: 'post-1',
    user_id: 'user-arnel-789',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: 'head-3',
    post_id: 'post-2',
    user_id: 'user-mark-123',
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString()
  }
];

class MockEngine {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY_PROFILES)) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
    }
    if (!localStorage.getItem(STORAGE_KEY_POSTS)) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(INITIAL_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEY_COMMENTS)) {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEY_HEADCOUNTS)) {
      localStorage.setItem(STORAGE_KEY_HEADCOUNTS, JSON.stringify(INITIAL_HEADCOUNTS));
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROFILES);
      return data ? JSON.parse(data) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  }

  getProfile(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  saveProfile(profile: Profile): Profile {
    const list = this.getProfiles();
    const idx = list.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...profile };
    } else {
      list.push(profile);
    }
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(list));
    this.notify();
    return profile;
  }

  // --- Posts ---
  getPosts(): Post[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_POSTS);
      const rawPosts: Post[] = data ? JSON.parse(data) : INITIAL_POSTS;
      const profiles = this.getProfiles();
      const comments = this.getComments();
      const headcounts = this.getHeadcounts();
      const currentUserId = this.getCurrentUser()?.id;

      return rawPosts
        .map(post => {
          const author = profiles.find(p => p.id === post.user_id);
          const postComments = comments.filter(c => c.post_id === post.id);
          const postHeadcounts = headcounts.filter(h => h.post_id === post.id);
          const userJoined = currentUserId ? postHeadcounts.some(h => h.user_id === currentUserId) : false;
          const roster = postHeadcounts
            .map(h => profiles.find(p => p.id === h.user_id))
            .filter((p): p is Profile => Boolean(p));

          return {
            ...post,
            profile: author,
            comments_count: postComments.length,
            headcounts_count: postHeadcounts.length,
            user_has_joined: userJoined,
            headcount_roster: roster
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return INITIAL_POSTS;
    }
  }

  createPost(data: Omit<Post, 'id' | 'created_at' | 'is_concluded'>): Post {
    const rawPosts = this.getRawPosts();
    const newPost: Post = {
      ...data,
      id: 'post-' + Date.now(),
      created_at: new Date().toISOString(),
      is_concluded: false,
    };
    rawPosts.unshift(newPost);
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(rawPosts));
    this.notify();
    return newPost;
  }

  togglePostConcluded(postId: string): void {
    const rawPosts = this.getRawPosts();
    const post = rawPosts.find(p => p.id === postId);
    if (post) {
      post.is_concluded = !post.is_concluded;
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(rawPosts));
      this.notify();
    }
  }

  deletePost(postId: string): void {
    const rawPosts = this.getRawPosts().filter(p => p.id !== postId);
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(rawPosts));
    // Also delete associated comments & headcounts
    const comments = this.getComments().filter(c => c.post_id !== postId);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    const headcounts = this.getHeadcounts().filter(h => h.post_id !== postId);
    localStorage.setItem(STORAGE_KEY_HEADCOUNTS, JSON.stringify(headcounts));
    this.notify();
  }

  private getRawPosts(): Post[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_POSTS);
      return data ? JSON.parse(data) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  }

  // --- Comments ---
  getComments(postId?: string): Comment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_COMMENTS);
      const list: Comment[] = data ? JSON.parse(data) : INITIAL_COMMENTS;
      const profiles = this.getProfiles();

      const mapped = list.map(c => ({
        ...c,
        profile: profiles.find(p => p.id === c.user_id)
      }));

      if (postId) {
        return mapped
          .filter(c => c.post_id === postId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
      return mapped;
    } catch {
      return INITIAL_COMMENTS;
    }
  }

  createComment(postId: string, userId: string, text: string): Comment {
    const comments = this.getRawComments();
    const newComment: Comment = {
      id: 'comm-' + Date.now(),
      post_id: postId,
      user_id: userId,
      comment_text: text,
      created_at: new Date().toISOString()
    };
    comments.push(newComment);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    this.notify();
    return newComment;
  }

  deleteComment(commentId: string): void {
    const comments = this.getRawComments().filter(c => c.id !== commentId);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    this.notify();
  }

  private getRawComments(): Comment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_COMMENTS);
      return data ? JSON.parse(data) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  }

  // --- Headcounts ("Mo-apil Ko") ---
  getHeadcounts(): Headcount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HEADCOUNTS);
      return data ? JSON.parse(data) : INITIAL_HEADCOUNTS;
    } catch {
      return INITIAL_HEADCOUNTS;
    }
  }

  toggleHeadcount(postId: string, userId: string): { joined: boolean } {
    const list = this.getHeadcounts();
    const existingIndex = list.findIndex(h => h.post_id === postId && h.user_id === userId);
    let joined = false;

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      joined = false;
    } else {
      list.push({
        id: 'head-' + Date.now(),
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      joined = true;
    }

    localStorage.setItem(STORAGE_KEY_HEADCOUNTS, JSON.stringify(list));
    this.notify();
    return { joined };
  }

  // --- Mock Auth Sessions ---
  getCurrentUser(): { id: string; email: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: { id: string; email: string } | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
    this.notify();
  }

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_POSTS);
    localStorage.removeItem(STORAGE_KEY_COMMENTS);
    localStorage.removeItem(STORAGE_KEY_HEADCOUNTS);
    localStorage.removeItem(STORAGE_KEY_PROFILES);
    this.ensureInitialized();
    this.notify();
  }
}

export const mockEngine = new MockEngine();

