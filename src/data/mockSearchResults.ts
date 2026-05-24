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
  isNew?: boolean;
};

export const MOCK_SEARCH_USERS: SearchMateUser[] = [
  {
    id: 'u1',
    name: 'John vignesh',
    tenureId: 'I2FR3782',
    categories: ['Shopping Mate'],
    ratePerHour: 50,
    avatar: 'https://i.pravatar.cc/150?img=45',
    district: 'Dakshina Kannada',
    gender: 'female',
    age: 28,
  },
  {
    id: 'u2',
    name: 'Prabas',
    tenureId: 'I2FR3782',
    categories: ['Shopping Mate', 'Movie Mate', 'Time Pass Mate'],
    ratePerHour: 50,
    avatar: 'https://i.pravatar.cc/150?img=11',
    district: 'Udupi',
    gender: 'male',
    age: 32,
    isNew: true,
  },
  {
    id: 'u3',
    name: 'Eagle',
    tenureId: 'VSHDF533',
    categories: ['Movie Mate', 'Talking Mate'],
    ratePerHour: 67,
    avatar: 'https://i.pravatar.cc/150?img=32',
    district: 'Dakshina Kannada',
    gender: 'male',
    age: 26,
  },
  {
    id: 'u4',
    name: 'Spider',
    tenureId: 'FGR45IH',
    categories: ['Hospital Mate', 'Home Mate'],
    ratePerHour: 55,
    avatar: 'https://i.pravatar.cc/150?img=15',
    district: 'Udupi',
    gender: 'female',
    age: 34,
  },
  {
    id: 'u5',
    name: 'Swan',
    tenureId: 'FGR45IH',
    categories: ['Travel Mate', 'Food Mate'],
    ratePerHour: 60,
    avatar: 'https://i.pravatar.cc/150?img=12',
    district: 'Dakshina Kannada',
    gender: 'male',
    age: 29,
  },
  {
    id: 'u6',
    name: 'Sparrow',
    tenureId: 'FGR45IH',
    categories: ['Shopping Mate', 'Pub Mate'],
    ratePerHour: 50,
    avatar: 'https://i.pravatar.cc/150?img=5',
    district: 'Udupi',
    gender: 'male',
    age: 24,
  },
];
