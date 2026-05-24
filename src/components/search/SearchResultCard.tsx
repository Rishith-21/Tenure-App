import React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {SearchMateUser} from '../../data/mockSearchResults';

type Props = {
  user: SearchMateUser;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

const SearchResultCard = ({
  user,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) => {
  const categoryText =
    user.categories.length > 2
      ? `${user.categories.slice(0, 2).join(', ')} .......`
      : user.categories.join(', ');

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {user.isNew ? (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      ) : null}

      <Image source={{uri: user.avatar}} style={styles.avatar} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.idText}>id : {user.tenureId}</Text>
            <Text style={styles.category}>{categoryText}</Text>
          </View>

          <Pressable onPress={onToggleFavorite} hitSlop={10}>
            <Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <View style={styles.ratePill}>
          <Text style={styles.rateIcon}>📅</Text>
          <Text style={styles.rateText}>₹ {user.ratePerHour}/H</Text>
          <Text style={styles.rateMenu}>☰</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default SearchResultCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#111111',
    borderBottomRightRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    marginTop: 4,
  },
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameBlock: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },
  idText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  category: {
    fontSize: 13,
    color: '#333333',
    marginTop: 6,
    lineHeight: 18,
  },
  heart: {
    fontSize: 22,
    color: '#111111',
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#003B57',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  rateIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  rateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  rateMenu: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
