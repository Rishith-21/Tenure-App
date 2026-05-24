import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {UI} from '../../theme/ui';

/** Static map-style block until map SDK + backend are integrated. */
const HomeMapPlaceholder = () => (
  <View style={styles.container}>
    <View style={styles.grid}>
      {Array.from({length: 6}).map((_, row) => (
        <View key={`r-${row}`} style={styles.row}>
          {Array.from({length: 4}).map((__, col) => (
            <View key={`c-${row}-${col}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
    <View style={styles.roadH} />
    <View style={styles.roadV} />
    <View style={styles.pinWrap}>
      <View style={styles.pinCard}>
        <Text style={styles.pin}>📍</Text>
        <Text style={styles.pinLabel}>L. B. NAGAR LB</Text>
      </View>
    </View>
  </View>
);

export default HomeMapPlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8D8D8',
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
    padding: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 3,
    backgroundColor: '#EEEBE4',
    borderRadius: 6,
  },
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '42%',
    width: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  pinWrap: {
    position: 'absolute',
    top: '38%',
    left: '34%',
    alignItems: 'center',
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  pin: {
    fontSize: 18,
    marginRight: 8,
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: UI.textSecondary,
  },
});
