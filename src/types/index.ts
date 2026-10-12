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
    badgeBg: 'bg-[#45b2f0]/10 text-[#1e1c1c] border-[#45b2f0]/40',
    badgeText: 'text-[#45b2f0]',
    borderColor: 'border-[#45b2f0]',
    description: 'Hagit o panawag para mag-abot sa court karong hapon o gabii'
  },
  'Naa Nanulong': {
    id: 'Naa Nanulong',
    label: 'Naa Nanulong',
    sublabel: 'Visitors / Dayo Arrived',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-600',
    borderColor: 'border-rose-500',
    description: 'Naay grupo gikan laing barangay o sitio nga gustong moduwa'
  },
  'Need Player': {
    id: 'Need Player',
    label: 'Need Player',
    sublabel: 'Kulang sa Kontra / Kauban',
    badgeBg: 'bg-[#45b2f0]/15 text-[#1e1c1c] border-[#45b2f0]/50',
    badgeText: 'text-[#45b2f0]',
    borderColor: 'border-[#45b2f0]',
    description: 'Kulang ug 1, 2, o 3 ka magduduwa aron makasugod dayon'
  },
  'Manong sa Court': {
    id: 'Manong sa Court',
    label: 'Manong sa Court',
    sublabel: 'Current Queue / Rotation',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-400',
    description: 'Kinsay sunod mosulod o kinsay daog-manong sa court karon'
  }
};

