export type SearchMateUser = {
  id: string;
  name: string;
  tenureId: string;
  categories: string[];
  ratePerHour: number;
  avatar: string;
  district: string;
  gender: 'male' | 'female';
  age: number;
  rating?: number;
  isNew?: boolean;
};

export const MOCK_SEARCH_USERS: SearchMateUser[] = [
  {
    id: 'u1',
    name: 'John vignesh',
    tenureId: 'I2FR3782',
    categories: ['Shopping Mate'],
    ratePerHour: 50,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    district: 'Dakshina Kannada',
    gender: 'female',
    age: 28,
    rating: 4.9,
  },
  {
    id: 'u2',
    name: 'Prabas',
    tenureId: 'I2FR3782',
    categories: ['Shopping Mate', 'Movie Mate', 'Time Pass Mate'],
    ratePerHour: 50,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    district: 'Udupi',
    gender: 'male',
    age: 32,
    rating: 4.8,
    isNew: true,
  },
  {
    id: 'u3',
    name: 'Eagle',
    tenureId: 'VSHDF533',
    categories: ['Movie Mate', 'Talking Mate'],
    ratePerHour: 67,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    district: 'Dakshina Kannada',
    gender: 'male',
    age: 26,
    rating: 4.7,
  },
  {
    id: 'u4',
    name: 'Spider',
    tenureId: 'FGR45IH',
    categories: ['Hospital Mate', 'Home Mate'],
    ratePerHour: 55,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
    district: 'Udupi',
    gender: 'female',
    age: 34,
    rating: 4.9,
  },
  {
    id: 'u5',
    name: 'Swan',
    tenureId: 'FGR45IH',
    categories: ['Travel Mate', 'Food Mate'],
    ratePerHour: 60,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    district: 'Dakshina Kannada',
    gender: 'male',
    age: 29,
    rating: 4.6,
  },
  {
    id: 'u6',
    name: 'Sparrow',
    tenureId: 'FGR45IH',
    categories: ['Shopping Mate', 'Pub Mate'],
    ratePerHour: 50,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80',
    district: 'Udupi',
    gender: 'male',
    age: 24,
    rating: 4.5,
  },
  {
    id: 'u7',
    name: 'Maya',
    tenureId: 'RT150X01',
    categories: ['Travel Mate', 'Hospital Mate'],
    ratePerHour: 150,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
    district: 'Bangalore Urban',
    gender: 'female',
    age: 31,
    rating: 5.0,
  },
  {
    id: 'u8',
    name: 'Rohan',
    tenureId: 'RT280K92',
    categories: ['Movie Mate', 'Food Mate'],
    ratePerHour: 280,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
    district: 'Dakshina Kannada',
    gender: 'male',
    age: 38,
    rating: 4.8,
  },
];
