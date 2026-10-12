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
    badgeBg: 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30',
    badgeText: 'text-[#FF5500]',
    borderColor: 'border-[#FF5500]',
    description: 'Hagit o panawag para mag-abot sa court karong hapon o gabii'
  },
  'Naa Nanulong': {
    id: 'Naa Nanulong',
    label: 'Naa Nanulong',
    sublabel: 'Visitors / Dayo Arrived',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
    badgeText: 'text-red-400',
    borderColor: 'border-red-500',
    description: 'Naay grupo gikan laing barangay o sitio nga gustong moduwa'
  },
  'Need Player': {
    id: 'Need Player',
    label: 'Need Player',
    sublabel: 'Kulang sa Kontra / Kauban',
    badgeBg: 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/30',
    badgeText: 'text-[#00D2FF]',
    borderColor: 'border-[#00D2FF]',
    description: 'Kulang ug 1, 2, o 3 ka magduduwa aron makasugod dayon'
  },
  'Manong sa Court': {
    id: 'Manong sa Court',
    label: 'Manong sa Court',
    sublabel: 'Current Queue / Rotation',
    badgeBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    badgeText: 'text-amber-300',
    borderColor: 'border-amber-400',
    description: 'Kinsay sunod mosulod o kinsay daog-manong sa court karon'
  }
};

