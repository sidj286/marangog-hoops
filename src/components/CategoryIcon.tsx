import React from 'react';
import { Swords, UserPlus, Timer } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';
import type { PostCategory } from '../types';

interface CategoryIconProps {
  category: PostCategory;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-4 h-4'
}) => {
  switch (category) {
    case 'Magduwa Hapon':
      return <BasketballIcon className={className} />;
    case 'Naa Nanulong':
      return <Swords className={className} />;
    case 'Need Player':
      return <UserPlus className={className} />;
    case 'Manong sa Court':
      return <Timer className={className} />;
    default:
      return <BasketballIcon className={className} />;
  }
};
