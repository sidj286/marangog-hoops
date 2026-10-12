export type PostCategory = 
  | 'Magduwa Hapon' 
  | 'Naa Nanulong' 
  | 'Need Player' 
  | 'Manong sa Court';

export interface Profile {
  id: string;
  display_name: string;
  purok: string;
  monicker?: string | null;
  created_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  category: PostCategory;
  court_name: string;
  message: string;
  players_needed: number;
  is_concluded: boolean;
  created_at: string;
  // Joined or calculated client fields
  profile?: Profile;
  comments_count?: number;
  headcounts_count?: number;
  user_has_joined?: boolean;
  headcount_roster?: Profile[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  // Joined or looked up profile
  profile?: Profile;
}

export interface Headcount {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  profile?: Profile;
}

export interface CategoryInfo {
  id: PostCategory;
  label: string;
  sublabel: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
}

export const CATEGORIES: Record<PostCategory, CategoryInfo> = {
  'Magduwa Hapon': {
    id: 'Magduwa Hapon',
    label: 'Magduwa Hapon',
    sublabel: 'Pick-up Game Invite',
    emoji: '🏀',
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    badgeText: 'text-orange-400',
    borderColor: 'border-orange-500',
    description: 'Hagit o panawag para mag-abot sa court karong hapon o gabii'
  },
  'Naa Nanulong': {
    id: 'Naa Nanulong',
    label: 'Naa Nanulong',
    sublabel: 'Visitors / Dayo Arrived',
    emoji: '⚔️',
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    badgeText: 'text-red-400',
    borderColor: 'border-red-500',
    description: 'Naay grupo gikan laing barangay o sitio nga gustong moduwa'
  },
  'Need Player': {
    id: 'Need Player',
    label: 'Need Player',
    sublabel: 'Kulang sa Kontra / Kauban',
    emoji: '🙋‍♂️',
    badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500',
    description: 'Kulang ug 1, 2, o 3 ka magduduwa aron makasugod dayon'
  },
  'Manong sa Court': {
    id: 'Manong sa Court',
    label: 'Manong sa Court',
    sublabel: 'Current Queue / Rotation',
    emoji: '⏳',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500',
    description: 'Kinsay sunod mosulod o kinsay daog-manong sa court karon'
  }
};

export const COMMON_COURTS = [
  'Marangog Main Court',
  'Sitio Ilaya Covered Court',
  'Sitio Riverside Half-Court',
  'Purok Mangga Court',
  'Marangog Elementary Court'
];

export const POPULAR_PUROKS = [
  'Purok 1',
  'Purok 2',
  'Purok 3',
  'Purok 4',
  'Purok 5',
  'Sitio Ilaya',
  'Sitio Riverside',
  'Sitio Centro'
];
