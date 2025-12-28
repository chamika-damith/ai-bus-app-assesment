import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { 
  Users, 
  Car, 
  DollarSign, 
  TrendingUp,
  Activity,
  AlertCircle 
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: <Users size={24} color={Colors.primary} />,
    },
    {
      title: 'Active Drivers',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: <Car size={24} color={Colors.success} />,
    },
    {
      title: 'Total Revenue',
      value: '$45,678',
      change: '+18%',
      changeType: 'positive',
      icon: <DollarSign size={24} color={Colors.warning} />,
    },
    {
      title: 'Rides Today',
      value: '156',
      change: '-3%',
      changeType: 'negative',
      icon: <Activity size={24} color={Colors.secondary} />,
    },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Driver Verification Pending',
      message: '5 drivers are waiting for document verification',
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 2:00 AM',
      time: '4 hours ago',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'New driver registered',
      user: 'John Smith',
      time: '5 minutes ago',
    },
    {
      id: '2',
      action: 'Ride completed',
      user: 'Alice Johnson → Bob Wilson',
      time: '12 minutes ago',
    },
    {
      id: '3',
      action: 'Payment processed',
      user: 'Sarah Davis',
      time: '25 minutes ago',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {user?.name}! 👋</Text>
          <Text style={styles.subtitle}>Here's what's happening today</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                {stat.icon}
                <View style={[
                  styles.changeIndicator,
                  stat.changeType === 'positive' ? styles.positiveChange : styles.negativeChange
                ]}>
                  <TrendingUp size={12} color={
                    stat.changeType === 'positive' ? Colors.success : Colors.danger
                  } />
                  <Text style={[
                    styles.changeText,
                    { color: stat.changeType === 'positive' ? Colors.success : Colors.danger }
                  ]}>
                    {stat.change}
                  </Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <AlertCircle 
                  size={20} 
                  color={alert.type === 'warning' ? Colors.warning : Colors.info} 
                />
                <Text style={styles.alertTitle}>{alert.title}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityUser}>{activity.user}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positiveChange: {},
  negativeChange: {},
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  alertsSection: {
    marginBottom: 30,
  },
  alertCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  activitySection: {
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});