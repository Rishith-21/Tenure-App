import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  MateSocialLink,
  openMateSocialLink,
} from '../../../utils/mateSocialLinks';
import {useTheme} from '../../../context/ThemeContext';

type Props = {
  link: MateSocialLink;
};

const SocialLinkCard = ({link}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${link.label}, ${link.displayUrl}`}
      onPress={() => openMateSocialLink(link.url)}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{link.icon}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.platform}>{link.label}</Text>
        <Text style={styles.handle} numberOfLines={1}>
          {link.displayUrl}
        </Text>
      </View>
      <Text style={styles.arrow}>↗</Text>
    </Pressable>
  );
};

export default SocialLinkCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      marginBottom: 8,
    },
    pressed: {
      opacity: 0.9,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    icon: {
      fontSize: 18,
    },
    text: {
      flex: 1,
      minWidth: 0,
    },
    platform: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    handle: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    arrow: {
      fontSize: 15,
      color: c.textHint,
      fontWeight: '500',
    },
  });
