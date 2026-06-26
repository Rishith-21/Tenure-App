import React, {useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useAlertsStore} from '../store/alertsStore';
import ScreenHeader from '../components/navigation/ScreenHeader';
import {spacing, radius} from '../theme/tokens';

const AlertsScreen = () => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const insets = useSafeAreaInsets();

  const {alerts, loading, fetchAlerts, markAsRead, markAllAsRead} = useAlertsStore();

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts]),
  );

  const hasUnread = useMemo(() => alerts.some(a => !a.read), [alerts]);

  // Helper to determine the badge icon and color based on alert kind
  const getAlertVisuals = (kind: string) => {
    switch (kind) {
      case 'request_accepted':
        return {
          icon: '✓',
          bg: '#E8F5E9', // Light green
          color: '#2E7D32', // Dark green
        };
      case 'meet_canceled':
      case 'meet_expired':
        return {
          icon: '✕',
          bg: '#FFEBEE', // Light red
          color: '#C62828', // Dark red
        };
      default:
        return {
          icon: '•',
          bg: colors.chip,
          color: colors.textSecondary,
        };
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Alerts"
        right={
          <View style={styles.headerRightWrap}>
            {hasUnread && (
              <Pressable onPress={() => markAllAsRead()} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 100},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchAlerts()}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }>
        {alerts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>All quiet for now</Text>
            <Text style={styles.emptyBody}>
              Request updates and session alerts will appear here once you start using Tenure.
            </Text>
          </View>
        ) : (
          alerts.map(alert => {
            const visuals = getAlertVisuals(alert.kind);
            return (
              <Pressable
                key={alert.id}
                onPress={() => {
                  if (!alert.read) {
                    markAsRead(alert.id);
                  }
                }}
                style={[
                  styles.alertCard,
                  !alert.read && styles.alertCardUnread,
                ]}>
                <View style={[styles.badge, {backgroundColor: visuals.bg}]}>
                  <Text style={[styles.badgeText, {color: visuals.color}]}>
                    {visuals.icon}
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={[styles.messageText, !alert.read && styles.messageTextUnread]}>
                    {alert.message}
                  </Text>
                  <Text style={styles.timestampText}>{alert.timestamp}</Text>
                </View>

                {!alert.read && <View style={styles.unreadDot} />}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default AlertsScreen;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    headerRightWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    markAllBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: c.chip,
      borderRadius: tokens.radius.pill,
    },
    markAllText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brand,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    emptyWrap: {
      marginTop: 64,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.3,
    },
    emptyBody: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: '500',
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 21,
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: c.bgElevated,
      borderRadius: tokens.radius.lg,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      position: 'relative',
    },
    alertCardUnread: {
      borderColor: c.brand,
      backgroundColor: c.bg,
      ...tokens.shadows.soft(c.shadow),
    },
    badge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    badgeText: {
      fontSize: 16,
      fontWeight: '800',
    },
    cardContent: {
      flex: 1,
      paddingRight: 12,
    },
    messageText: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '500',
      lineHeight: 19,
    },
    messageTextUnread: {
      color: c.text,
      fontWeight: '700',
    },
    timestampText: {
      marginTop: 4,
      fontSize: 11,
      color: c.textMuted,
      fontWeight: '500',
    },
    unreadDot: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.brand,
    },
  });

