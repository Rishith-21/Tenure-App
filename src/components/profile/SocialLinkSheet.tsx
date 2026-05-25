import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import BottomSheetModal from '../ui/BottomSheetModal';
import {SocialPlatform} from '../../constants/profileOptions';
import {isValidSocialUrl, normalizeSocialUrl} from '../../utils/socialLinks';
import {UI, uiLayout, uiStyles} from '../../theme/ui';

type Props = {
  visible: boolean;
  platform: SocialPlatform | null;
  onClose: () => void;
  onConfirm: (url: string) => void;
};

const SocialLinkSheet = ({visible, platform, onClose, onConfirm}: Props) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setUrl('');
      setError('');
    }
  }, [visible, platform?.id]);

  const handleSubmit = () => {
    if (!isValidSocialUrl(url)) {
      setError('Enter a valid profile link or username');
      return;
    }
    onConfirm(normalizeSocialUrl(url));
    onClose();
  };

  if (!platform) {
    return null;
  }

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={uiStyles.sheetHandle} />
        <Text style={styles.title}>
          {platform.icon} {platform.label} profile
        </Text>
        <Text style={styles.subtitle}>
          Paste your public profile link or username
        </Text>

        <TextInput
          value={url}
          onChangeText={text => {
            setUrl(text);
            setError('');
          }}
          placeholder={platform.placeholder}
          placeholderTextColor={UI.textHint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
          autoFocus={visible}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({pressed}) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={handleSubmit}>
          <Text style={styles.primaryBtnText}>Add link</Text>
        </Pressable>

        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </Pressable>
    </BottomSheetModal>
  );
};

export default SocialLinkSheet;

const styles = StyleSheet.create({
  sheet: {
    ...uiLayout.sheet,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: UI.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: UI.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    ...uiLayout.inputField,
    fontSize: 15,
    color: UI.text,
    marginBottom: 8,
  },
  error: {
    color: UI.danger,
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  primaryBtn: {
    backgroundColor: UI.primary,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnPressed: {opacity: 0.92},
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.textMuted,
  },
});
