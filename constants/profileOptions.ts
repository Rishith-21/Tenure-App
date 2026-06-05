export type SocialPlatform = {
  id: string;
  label: string;
  icon: string;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📷',
    placeholder: 'instagram.com/yourusername',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: '👤',
    placeholder: 'facebook.com/yourprofile',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '▶',
    placeholder: 'youtube.com/@channel',
  },
  {
    id: 'website',
    label: 'Website',
    icon: '🌐',
    placeholder: 'yourwebsite.com',
  },
];

export const PROFESSION_OPTIONS = [
  'Doctor',
  'Engineer',
  'Student',
  'Content creator',
  'Teacher',
  'Business owner',
  'Artist',
  'Fitness trainer',
  'Lawyer',
  'Designer',
  'Developer',
  'Other',
] as const;

export const VEHICLE_OPTIONS = [
  {id: 'bike', label: 'Bike', icon: '🏍'},
  {id: 'car', label: 'Car', icon: '🚗'},
] as const;
