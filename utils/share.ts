import {Share} from 'react-native';

type ShareProfileOptions = {
  name?: string;
  tenureId?: string;
};

export async function shareTenureProfile({
  name,
  tenureId,
}: ShareProfileOptions): Promise<void> {
  const displayName = name?.trim() || 'my';
  const idLine = tenureId?.trim() ? `\nTenure ID: ${tenureId.trim()}` : '';
  const message = `Check out ${displayName} on Tenure!${idLine}`;

  try {
    await Share.share({
      message,
      title: 'Tenure profile',
    });
  } catch {
    // User dismissed the share sheet.
  }
}