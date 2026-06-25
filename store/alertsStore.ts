import {create} from 'zustand';
import {HistoryAlert} from '../types/historyAlert';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  ApiNotification,
} from '../utils/api';
import {dateToMateString} from '../utils/meetTime';

type ExtendedHistoryAlert = HistoryAlert & {
  read: boolean;
};

type AlertsState = {
  alerts: ExtendedHistoryAlert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: (filter?: 'all' | 'payments') => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const mapApiToFrontend = (notif: ApiNotification): ExtendedHistoryAlert => {
  const d = new Date(notif.createdAt);
  const formattedTime = Number.isNaN(d.getTime()) ? notif.createdAt : dateToMateString(d);

  return {
    id: notif.id,
    kind: notif.kind,
    message: notif.message,
    timestamp: formattedTime,
    read: notif.read,
  };
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async (filter = 'all') => {
    set({loading: true, error: null});
    try {
      const data = await fetchNotifications(filter);
      const mapped = data.map(mapApiToFrontend);
      set({alerts: mapped, loading: false});
    } catch (err) {
      console.log('Error fetching alerts inside store:', err);
      set({error: 'Failed to load notifications', loading: false});
    }
  },

  markAsRead: async id => {
    // Optimistic UI update
    set(state => ({
      alerts: state.alerts.map(a => (a.id === id ? {...a, read: true} : a)),
    }));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.log('Error marking notification as read in store:', err);
    }
  },

  markAllAsRead: async () => {
    // Optimistic UI update
    set(state => ({
      alerts: state.alerts.map(a => ({...a, read: true})),
    }));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.log('Error marking all notifications as read in store:', err);
    }
  },
}));
