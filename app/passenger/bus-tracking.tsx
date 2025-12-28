import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bell, BellOff, Users, MapPin, Clock } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface BusInfo {
  id: string;
  routeNumber: string;
  routeName: string;
  arrivalTime: string;
  isLive: boolean;
  crowdLevel: 'low' | 'medium' | 'high';
  distanceToUser: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

const mockBusInfo: BusInfo = {
  id: '1',
  routeNumber: '129',
  routeName: 'Ratnapura - Colombo',
  arrivalTime: '8 min',
  isLive: true,
  crowdLevel: 'medium',
  distanceToUser: 2.5,
  currentLocation: {
    latitude: 6.9271,
    longitude: 79.8612,
  },
};

export default function BusTracking() {
  const params = useLocalSearchParams();
  const busId = params.busId as string;
  const routeId = params.routeId as string;
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [busInfo, setBusInfo] = useState<BusInfo>(mockBusInfo);
  const [isOffRoute, setIsOffRoute] = useState(false);

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setBusInfo(prev => ({
        ...prev,
        arrivalTime: Math.max(1, parseInt(prev.arrivalTime) - 1) + ' min',
        distanceToUser: Math.max(0.1, prev.distanceToUser - 0.1),
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'low': return Colors.crowd.low;
      case 'medium': return Colors.crowd.medium;
      case 'high': return Colors.crowd.high;
      default: return Colors.gray[400];
    }
  };

  const getCrowdLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Less Crowded';
      case 'medium': return 'Moderately Crowded';
      case 'high': return 'Highly Crowded';
      default: return 'Unknown';
    }
  };

  const handleReportCrowd = () => {
    router.push(`/passenger/crowd-report?busId=${busId}`);
  };

  const handleOffRouteGuidance = () => {
    router.push(`/passenger/off-route-guidance?busId=${busId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bus Tracking</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          {notificationsEnabled ? (
            <Bell size={24} color={Colors.primary} />
          ) : (
            <BellOff size={24} color={Colors.gray[400]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color={Colors.primary} />
          <Text style={styles.mapText}>Live Bus Location</Text>
          <Text style={styles.mapSubtext}>Bus {busInfo.routeNumber} - {busInfo.routeName}</Text>
          
          {/* Live indicator */}
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Bus Info Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        {/* Bus Header */}
        <View style={styles.busHeader}>
          <View style={styles.routeNumberBadge}>
            <Text style={styles.routeNumber}>{busInfo.routeNumber}</Text>
          </View>
          <View style={styles.busHeaderInfo}>
            <Text style={styles.routeName}>{busInfo.routeName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.liveStatus}>
                <View style={styles.liveStatusDot} />
                <Text style={styles.liveStatusText}>
                  {busInfo.isLive ? 'Live tracking' : 'Predicted'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Arrival Time */}
        <View style={styles.arrivalSection}>
          <View style={styles.arrivalTimeContainer}>
            <Clock size={24} color={Colors.primary} />
            <Text style={styles.arrivalTime}>{busInfo.arrivalTime}</Text>
            <Text style={styles.arrivalLabel}>arrival time</Text>
          </View>
        </View>

        {/* Bus Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Users size={20} color={getCrowdLevelColor(busInfo.crowdLevel)} />
            <Text style={styles.detailLabel}>Crowd Level</Text>
            <Text style={[styles.detailValue, { color: getCrowdLevelColor(busInfo.crowdLevel) }]}>
              {getCrowdLevelText(busInfo.crowdLevel)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={20} color={Colors.text.secondary} />
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>
              {busInfo.distanceToUser.toFixed(1)} km away
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Report Crowd"
            onPress={handleReportCrowd}
            variant="outline"
            style={styles.actionButton}
          />
          
          {isOffRoute && (
            <Button
              title="Get Off-Route Guidance"
              onPress={handleOffRouteGuidance}
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Notification Toggle */}
        <TouchableOpacity 
          style={styles.notificationToggle}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          <View style={styles.notificationToggleContent}>
            {notificationsEnabled ? (
              <Bell size={20} color={Colors.primary} />
            ) : (
              <BellOff size={20} color={Colors.gray[400]} />
            )}
            <Text style={styles.notificationToggleText}>
              {notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
            </Text>
          </View>
          <Text style={styles.notificationSubtext}>
            Get notified 5 minutes before arrival
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  notificationButton: {
    padding: 4,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light,
    position: 'relative',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  liveIndicator: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  routeNumberBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  routeNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  busHeaderInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  liveStatusText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  arrivalSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
  },
  arrivalTimeContainer: {
    alignItems: 'center',
  },
  arrivalTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  arrivalLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  notificationToggle: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
  },
  notificationToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  notificationSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});