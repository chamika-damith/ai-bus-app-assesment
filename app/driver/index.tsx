import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { 
  Power, 
  DollarSign, 
  Clock, 
  Star, 
  Navigation,
  Users,
  TrendingUp 
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const stats = [
    {
      title: 'Today\'s Earnings',
      value: '$127.50',
      icon: <DollarSign size={24} color={Colors.success} />,
      change: '+12%',
    },
    {
      title: 'Hours Driven',
      value: '6.5h',
      icon: <Clock size={24} color={Colors.primary} />,
      change: '+0.5h',
    },
    {
      title: 'Trips Completed',
      value: '8',
      icon: <Navigation size={24} color={Colors.secondary} />,
      change: '+2',
    },
    {
      title: 'Rating',
      value: '4.8',
      icon: <Star size={24} color={Colors.warning} />,
      change: '+0.1',
    },
  ];

  const recentRides = [
    {
      id: '1',
      passenger: 'Alice Johnson',
      from: 'Downtown',
      to: 'Airport',
      time: '2 hours ago',
      earnings: '$45.00',
      rating: 5,
    },
    {
      id: '2',
      passenger: 'Bob Smith',
      from: 'Mall',
      to: 'University',
      time: '4 hours ago',
      earnings: '$18.50',
      rating: 4,
    },
  ];

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
            <Text style={styles.subtitle}>Ready to start driving?</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusButton, isOnline && styles.statusButtonOnline]}
            onPress={toggleOnlineStatus}
          >
            <Power size={20} color={isOnline ? Colors.white : Colors.gray[600]} />
            <Text style={[styles.statusText, isOnline && styles.statusTextOnline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                {stat.icon}
                <View style={styles.statChange}>
                  <TrendingUp size={12} color={Colors.success} />
                  <Text style={styles.changeText}>{stat.change}</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {isOnline && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>You're Online!</Text>
            <View style={styles.onlineCard}>
              <Users size={32} color={Colors.primary} />
              <Text style={styles.onlineTitle}>Looking for passengers...</Text>
              <Text style={styles.onlineSubtitle}>
                Stay in a busy area to get more ride requests
              </Text>
            </View>
          </View>
        )}

        <View style={styles.recentRides}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          {recentRides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.passengerName}>{ride.passenger}</Text>
                <Text style={styles.earnings}>{ride.earnings}</Text>
              </View>
              <View style={styles.rideRoute}>
                <Text style={styles.routeText}>{ride.from} → {ride.to}</Text>
              </View>
              <View style={styles.rideFooter}>
                <Text style={styles.rideTime}>{ride.time}</Text>
                <View style={styles.rideRating}>
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.ratingText}>{ride.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {!isOnline && (
          <Button
            title="Go Online"
            onPress={toggleOnlineStatus}
            style={styles.goOnlineButton}
          />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusButtonOnline: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[600],
    marginLeft: 6,
  },
  statusTextOnline: {
    color: Colors.white,
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
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    color: Colors.success,
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
  activeSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  onlineCard: {
    backgroundColor: Colors.light,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  onlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  onlineSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  recentRides: {
    marginBottom: 30,
  },
  rideCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  earnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  rideRoute: {
    marginBottom: 8,
  },
  routeText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  rideRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  goOnlineButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});