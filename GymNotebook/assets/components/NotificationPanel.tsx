
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationPanelProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  setNotifications,
  onClose,
}) => {
  const panelHeight = Dimensions.get('window').height * 0.8;

  React.useEffect(() => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
  }, []);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <MaterialIcons name="notifications" size={24} color="#FF5F6D" />
      </View>
      <View style={styles.notificationText}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{getTimeAgo(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { height: panelHeight }]}>
      <LinearGradient
        colors={['#302b63', '#24243e']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#aaaaaa',
    marginTop: 5,
  },
});

export default NotificationPanel;
