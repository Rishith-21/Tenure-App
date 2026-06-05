export type SettingsItemId =
  | 'personal-information'
  | 'change-password'
  | 'account-status'
  | 'deactivate-account'
  | 'delete-account'
  | 'profile-visibility'
  | 'public-profile-preview'
  | 'verification'
  | 'emergency-contact'
  | 'blocked-users'
  | 'report-problem'
  | 'notifications-requests'
  | 'notifications-chat'
  | 'notifications-reminders'
  | 'wallet'
  | 'earnings'
  | 'transactions'
  | 'appearance'
  | 'language'
  | 'help-support'
  | 'terms'
  | 'privacy-policy';

export type SettingsMenuItem = {
  id: SettingsItemId;
  label: string;
};

export type SettingsMenuSection = {
  id: string;
  title: string;
  items: SettingsMenuItem[];
};

/** Rows that never appear on the opening settings list. */
const HIDDEN_MENU_IDS = new Set<SettingsItemId>([
  'delete-account',
  'deactivate-account',
]);

export const SETTINGS_MENU: SettingsMenuSection[] = [
  {
    id: 'account',
    title: 'Account',
    items: [
      {id: 'personal-information', label: 'Personal information'},
      {id: 'change-password', label: 'Change password'},
      {id: 'account-status', label: 'Account status'},
    ],
  },
  {
    id: 'profile',
    title: 'Profile',
    items: [
      {id: 'profile-visibility', label: 'Profile visibility'},
      {id: 'public-profile-preview', label: 'Public profile preview'},
      {id: 'verification', label: 'Verification'},
    ],
  },
  {
    id: 'safety',
    title: 'Safety',
    items: [
      {id: 'emergency-contact', label: 'Emergency contact'},
      {id: 'blocked-users', label: 'Blocked users'},
      {id: 'report-problem', label: 'Report a problem'},
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    items: [
      {id: 'notifications-requests', label: 'Requests'},
      {id: 'notifications-chat', label: 'Chat'},
      {id: 'notifications-reminders', label: 'Reminders'},
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {id: 'wallet', label: 'Wallet'},
      {id: 'earnings', label: 'Earnings'},
      {id: 'transactions', label: 'Transactions'},
    ],
  },
  {
    id: 'app',
    title: 'App',
    items: [
      {id: 'appearance', label: 'Appearance'},
      {id: 'language', label: 'Language'},
    ],
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      {id: 'help-support', label: 'Help & Support'},
      {id: 'terms', label: 'Terms & Conditions'},
      {id: 'privacy-policy', label: 'Privacy Policy'},
    ],
  },
];

export type SettingsSearchEntry = {
  id: SettingsItemId;
  label: string;
  section: string;
  keywords: string[];
};

const SEARCH_EXTRAS: SettingsSearchEntry[] = [
  {
    id: 'deactivate-account',
    label: 'Deactivate account',
    section: 'Account',
    keywords: [
      'deactivate',
      'disable',
      'pause',
      'temporary',
      'break',
      'hide profile',
      'account status',
    ],
  },
  {
    id: 'delete-account',
    label: 'Delete account',
    section: 'Account',
    keywords: [
      'delete',
      'remove',
      'close account',
      'permanent',
      'erase',
      'account status',
    ],
  },
];

export const SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  ...SETTINGS_MENU.flatMap(section =>
    section.items.map(item => ({
      id: item.id,
      label: item.label,
      section: section.title,
      keywords: [item.label, section.title, section.id, item.id].map(s =>
        s.toLowerCase(),
      ),
    })),
  ),
  ...SEARCH_EXTRAS,
];

export function getVisibleSettingsMenu(): SettingsMenuSection[] {
  return SETTINGS_MENU.map(section => ({
    ...section,
    items: section.items.filter(item => !HIDDEN_MENU_IDS.has(item.id)),
  }));
}

export const settingsItemTitle = (id: SettingsItemId): string => {
  const fromExtras = SEARCH_EXTRAS.find(e => e.id === id);
  if (fromExtras) {
    return fromExtras.label;
  }
  for (const section of SETTINGS_MENU) {
    const item = section.items.find(i => i.id === id);
    if (item) {
      return item.label;
    }
  }
  return 'Settings';
};

export function resolveSettingsNavigation(
  id: SettingsItemId,
): 'account-status' | SettingsItemId {
  if (id === 'delete-account' || id === 'deactivate-account') {
    return 'account-status';
  }
  return id;
}
