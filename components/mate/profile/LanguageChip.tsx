import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';

type Props = {
  language: string;
};

const LanguageChip = ({language}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{language}</Text>
    </View>
  );
};

export default LanguageChip;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    text: {
      fontSize: 13,
      fontWeight: '500',
      color: c.text,
    },
  });
