import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  MapPin, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  Settings,
  User,
  Bus
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

interface LocationData {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
}

interface DriverSession {
  driverId: string;
  busId: string;
  routeId: string;
  isTracking: boolean;
  startTime: number;
}

const GPS_UPDATE_INTERVAL = 5000; // 5 seconds
const API_BASE_URL = 'http://your-server.com/api'; // Replace with your server URL

export default function GPSTracker() {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [session, setSession] = useState<DriverSession | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDistance: 0,
    averageSpeed: 0,
    trackingTime: 0,
    lastUpdate: null as Date | null,
  });

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeTracker();
    return () => {
      stopTracking();
    };
  }, []);

  const initializeTracker = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for GPS tracking.',
          [{ text: 'OK' }]
        );
        return;
      }
      setLocationPermission(true);

      // Check if driver is already logged in
      const savedSession = await AsyncStorage.getItem('@driver_session');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        setSession(parsedSession);
        if (parsedSession.isTracking) {
          startTracking();
        }
      } else {
        // Need to authenticate driver
        await authenticateDriver();
      }
    } catch (error) {
      console.error('Failed to initialize tracker:', error);
    }
  };

  const authenticateDriver = async () => {
    try {
      setIsLoading(true);
      
      // Get device ID
      const deviceId = await getDeviceId();
      
      // For demo, use user phone or generate one
      const phone = user?.phone || '+94771234567';
      
      const response = await fetch(`${API_BASE_URL}/driver/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          deviceId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newSession: DriverSession = {
          driverId: data.driver.driverId,
          busId: data.driver.busId,
          routeId: data.driver.routeId,
          isTracking: false,
          startTime: Date.now(),
        };
        
        setSession(newSession);
        await AsyncStorage.setItem('@driver_session', JSON.stringify(newSession));
        setIsOnline(true);
      } else {
        Alert.alert('Authentication Failed', data.error || 'Please contact admin to register your device.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Connection Error', 'Unable to connect to server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceId = async (): Promise<string> => {
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      // Use expo-device for better device identification
      const deviceName = Device.deviceName || 'unknown';
      const osName = Device.osName || Platform.OS;
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 9);
      deviceId = `device_${osName}_${deviceName}_${timestamp}_${random}`.replace(/\s+/g, '_');
      await AsyncStorage.setItem('@device_id', deviceId);
    }
    return deviceId;
  };

  const startTracking = async () => {
    if (!locationPermission || !session) return;

    try {
      setIsLoading(true);
      
      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_UPDATE_INTERVAL,
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading || 0,
            speed: (location.coords.speed || 0) * 3.6, // Convert m/s to km/h
            accuracy: location.coords.accuracy || 0,
          };
          
          setCurrentLocation(locationData);
          sendLocationUpdate(locationData);
          updateStats(locationData);
        }
      );

      // Update session
      const updatedSession = { ...session, isTracking: true };
      setSession(updatedSession);
      await AsyncStorage.setItem('@driver_session', JSON.stringify(updatedSession));
      
      setIsTracking(true);
      setIsOnline(true);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      Alert.alert('Tracking Error', 'Failed to start GPS tracking.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = async () => {
    try {
      // Stop location tracking
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
        trackingInterval.current = null;
      }

      // Update session
      if (session) {
        const updatedSession = { ...session, isTracking: false };
        setSession(updatedSession);
        await AsyncStorage.setItem('@driver_session', JSON.stringify(updatedSession));
      }

      setIsTracking(false);
      setIsOnline(false);
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  };

  const sendLocationUpdate = async (locationData: LocationData) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_BASE_URL}/driver/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: session.driverId,
          busId: session.busId,
          routeId: session.routeId,
          ...locationData,
          status: isTracking ? 'active' : 'idle',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOnline(true);
        setStats(prev => ({ ...prev, lastUpdate: new Date() }));
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      console.error('Failed to send location update:', error);
      setIsOnline(false);
    }
  };

  const updateStats = (locationData: LocationData) => {
    setStats(prev => ({
      ...prev,
      averageSpeed: locationData.speed,
      trackingTime: Date.now() - (session?.startTime || Date.now()),
    }));
  };

  const handleTrackingToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Initializing GPS Tracker...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <User size={48} color={Colors.gray[400]} />
          <Text style={styles.errorTitle}>Authentication Required</Text>
          <Text style={styles.errorText}>
            Please contact admin to register your device for GPS tracking.
          </Text>
          <Button
            title="Retry Authentication"
            onPress={authenticateDriver}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bus size={24} color={Colors.primary} />
          <View style={styles.headerInfo}>
            <Text style={styles.busId}>Bus {session.busId}</Text>
            <Text style={styles.routeId}>Route {session.routeId}</Text>
          </View>
        </View>
        <View style={styles.connectionStatus}>
          {isOnline ? (
            <Wifi size={20} color={Colors.success} />
          ) : (
            <WifiOff size={20} color={Colors.danger} />
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Tracking Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>GPS Tracking</Text>
            <Switch
              value={isTracking}
              onValueChange={handleTrackingToggle}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <Text style={styles.statusText}>
            {isTracking ? 'Broadcasting your location to passengers' : 'Tracking is paused'}
          </Text>
        </View>

        {/* Current Location */}
        {currentLocation && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.locationTitle}>Current Location</Text>
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationText}>
                Lat: {currentLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Lng: {currentLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Speed: {currentLocation.speed.toFixed(1)} km/h
              </Text>
              <Text style={styles.locationText}>
                Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
              </Text>
            </View>
          </View>
        )}

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageSpeed.toFixed(1)}</Text>
              <Text style={styles.statLabel}>km/h avg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(stats.trackingTime)}</Text>
              <Text style={styles.statLabel}>tracking</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.lastUpdate ? stats.lastUpdate.toLocaleTimeString() : '--:--'}
              </Text>
              <Text style={styles.statLabel}>last update</Text>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isTracking && styles.activeButton]}
            onPress={handleTrackingToggle}
            disabled={isLoading}
          >
            {isTracking ? (
              <Pause size={24} color={Colors.white} />
            ) : (
              <Play size={24} color={Colors.primary} />
            )}
            <Text style={[styles.controlButtonText, isTracking && styles.activeButtonText]}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/driver/settings')}
          >
            <Settings size={20} color={Colors.text.secondary} />
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  busId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  routeId: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  connectionStatus: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  locationDetails: {
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  controls: {
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeButtonText: {
    color: Colors.white,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  settingsButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});