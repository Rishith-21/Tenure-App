import {Alert, Linking} from 'react-native';
import {SOCIAL_PLATFORMS} from '../constants/profileOptions';
import type {MatePublicProfile} from '../data/mateProfiles';
import {normalizeSocialUrl} from './socialLinks';

export type MateSocialLink = {
  platformId: string;
  label: string;
  icon: string;
  url: string;
  displayUrl: string;
};

const MATE_SOCIAL_KEYS = ['instagram', 'youtube', 'website'] as const;

export function formatSocialDisplayUrl(url: string): string {
  try {
    const parsed = new URL(normalizeSocialUrl(url));
    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname.replace(/\/$/, '');
    if (!path || path === '/') {
      return host;
    }
    return `${host}${path}`;
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

export function getMateSocialLinks(
  social: MatePublicProfile['social'],
): MateSocialLink[] {
  const links: MateSocialLink[] = [];

  for (const key of MATE_SOCIAL_KEYS) {
    const raw = social[key];
    if (typeof raw !== 'string' || !raw.trim()) {
      continue;
    }
    const platform =
      SOCIAL_PLATFORMS.find(p => p.id === key) ??
      ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: '🔗',
        placeholder: '',
      } as const);
    const url = normalizeSocialUrl(raw);
    links.push({
      platformId: key,
      label: platform.label,
      icon: platform.icon,
      url,
      displayUrl: formatSocialDisplayUrl(url),
    });
  }

  return links;
}

export async function openMateSocialLink(url: string): Promise<void> {
  const normalized = normalizeSocialUrl(url);
  try {
    await Linking.openURL(normalized);
  } catch {
    Alert.alert(
      'Could not open link',
      'This link may be invalid or your device cannot open it.',
    );
  }
}
