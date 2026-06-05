import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = {
  color?: string;
  size?: number;
};

/** Left arrow with stem (←), not a chevron (<). */
const BackArrowIcon = ({color = '#014569', size = 12}: Props) => {
  const head = size * 0.48;
  const stemW = size * 0.95;

  return (
    <View style={[styles.row, {height: size}]}>
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: head,
          borderBottomWidth: head,
          borderRightWidth: head + 2,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: color,
        }}
      />
      <View
        style={{
          width: stemW,
          height: 2,
          backgroundColor: color,
          marginLeft: -1,
          borderRadius: 1,
        }}
      />
    </View>
  );
};

export default BackArrowIcon;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
