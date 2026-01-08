import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, Clock, XCircle, ChevronRight, CreditCard } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { getAPIClient } from '../../lib/api';

interface BusLocation {
  busId: string;
  routeId: string;
  routeName?: string;
  driverId: string;
  driverName?: string;
  location: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    accuracy: number;
    timestamp: number;
  };
  isActive: boolean;
  lastUpdate: string;
  estimatedArrival?: string;
}

interface RouteStop {
  stopId: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  order: number;
  estimatedTime: number;
}

interface RouteDetails {
  routeId: string;
  routeNumber: string;
  routeName: string;
  startPoint: {
    name: string;
    location: {
      coordinates: [number, number];
    };
  };
  endPoint: {
    name: string;
    location: {
      coordinates: [number, number];
    };
  };
  stops: RouteStop[];
  distance: number;
  estimatedDuration: number;
  color: string;
}

interface BusWithRoute {
  bus: BusLocation;
  route: RouteDetails | null;
}

export default function ActiveBusesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBuses, setActiveBuses] = useState<BusWithRoute[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusWithRoute | null>(null);
  const [showStopsModal, setShowStopsModal] = useState(false);
  const [routes, setRoutes] = useState<Map<string, RouteDetails>>(new Map());
  const apiClient = getAPIClient();

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // Load all routes first
      const routesData = await apiClient.getRoutes(true);
      const routesMap = new Map<string, RouteDetails>();
      const routesByIdMap = new Map<string, RouteDetails>();
      
      if (routesData) {
        routesData.forEach((route: RouteDetails) => {
          // Map by route number (e.g., "138")
          routesMap.set(route.routeNumber, route);
          // Map by route ID (e.g., "route_138")
          routesByIdMap.set(route.routeId, route);
        });
        setRoutes(routesMap);
      }

      // Load active buses
      const buses = await apiClient.getLiveBuses();
      
      if (buses) {
        // Match buses with their routes
        const busesWithRoutes: BusWithRoute[] = buses.map((busData: any) => {
          const bus = busData as BusLocation;
          let matchedRoute: RouteDetails | null = null;

          // Try matching by routeId first
          if (bus.routeId) {
            matchedRoute = routesByIdMap.get(bus.routeId) || null;
          }

          // If no match, try extracting route number from routeName
          if (!matchedRoute && bus.routeName) {
            const routeNumberMatch = bus.routeName.match(/^(\d+)/);
            if (routeNumberMatch) {
              matchedRoute = routesMap.get(routeNumberMatch[1]) || null;
            }
          }

          // If still no match, try direct routeNumber lookup
          if (!matchedRoute && bus.routeId) {
            matchedRoute = routesMap.get(bus.routeId) || null;
          }

          // Log warning if no route matched
          if (!matchedRoute) {
            console.warn(`No route matched for bus ${bus.busId}`, {
              routeId: bus.routeId,
              routeName: bus.routeName
            });
          }

          return {
            bus,
            route: matchedRoute
          };
        });

        console.log(`Loaded ${busesWithRoutes.length} buses, ${busesWithRoutes.filter(b => b.route).length} with matched routes`);
        setActiveBuses(busesWithRoutes);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBusPress = (busWithRoute: BusWithRoute) => {
    if (!busWithRoute.route) {
      Alert.alert(
        'Route Information Unavailable',
        'This bus does not have route details available. The driver may need to update their route information.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedBus(busWithRoute);
    setShowStopsModal(true);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestStop = (busLocation: BusLocation, stops: RouteStop[]) => {
    if (!stops || stops.length === 0) return null;

    let nearestStop = stops[0];
    let minDistance = calculateDistance(
      busLocation.location.latitude,
      busLocation.location.longitude,
      stops[0].location.coordinates[1],
      stops[0].location.coordinates[0]
    );

    stops.forEach(stop => {
      const distance = calculateDistance(
        busLocation.location.latitude,
        busLocation.location.longitude,
        stop.location.coordinates[1],
        stop.location.coordinates[0]
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    });

    return { stop: nearestStop, distance: minDistance };
  };

  const getTimeSinceUpdate = (lastUpdate: string) => {
    const now = new Date().getTime();
    const updateTime = new Date(lastUpdate).getTime();
    const diffSeconds = Math.floor((now - updateTime) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? Colors.success : Colors.gray[400];
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Offline';
  };

  // Calculate fare based on distance (LKR 10 base + LKR 5 per km)
  const calculateFare = (distance: number) => {
    const baseFare = 10;
    const perKmRate = 5;
    return baseFare + (distance * perKmRate);
  };

  // Handle stop click for payment
  const handleStopPress = (stop: RouteStop, stopIndex: number) => {
    if (!selectedBus) return;

    const { bus, route } = selectedBus;
    const nearest = findNearestStop(bus, route.stops);

    // Get current stop (nearest to bus)
    const currentStop = nearest?.stop;
    if (!currentStop) return;

    // Calculate distance between stops
    const distance = calculateDistance(
      currentStop.location.coordinates[1],
      currentStop.location.coordinates[0],
      stop.location.coordinates[1],
      stop.location.coordinates[0]
    );

    // Calculate estimated time (assume 30 km/h average speed)
    const estimatedTime = Math.ceil((distance / 30) * 60); // minutes

    // Calculate fare
    const fare = calculateFare(distance);

    // Navigate to payment screen
    setShowStopsModal(false);
    setTimeout(() => {
      router.push({
        pathname: '/passenger/payment',
        params: {
          busId: bus.busId,
          routeName: route.routeName,
          fromStop: currentStop.name,
          toStop: stop.name,
          distance: distance.toFixed(2),
          estimatedTime: estimatedTime.toString(),
          fare: fare.toFixed(2),
        },
      });
    }, 300);
  };

  const renderBusCard = (item: BusWithRoute) => {
    const { bus, route } = item;
    const statusColor = getStatusColor(bus.isActive);

    return (
      <TouchableOpacity
        key={bus.busId}
        style={styles.busCard}
        onPress={() => handleBusPress(item)}
      >
        <View style={styles.busHeader}>
          <View style={styles.busInfo}>
            <View style={[styles.routeBadge, { backgroundColor: route?.color + '20' || Colors.light }]}>
              <Text style={[styles.routeBadgeText, { color: route?.color || Colors.primary }]}>
                {route?.routeNumber || bus.routeId || 'N/A'}
              </Text>
            </View>
            <View style={styles.busDetails}>
              <Text style={styles.busId}>{bus.busId}</Text>
              <Text style={styles.routeName}>{route?.routeName || 'Unknown Route'}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(bus.isActive)}
            </Text>
          </View>
        </View>

        {route ? (
          <View style={styles.routeInfo}>
            <MapPin size={14} color={Colors.gray[500]} />
            <Text style={styles.routePoints}>
              {route.startPoint.name} → {route.endPoint.name}
            </Text>
          </View>
        ) : (
          <View style={styles.routeInfo}>
            <Text style={styles.noRouteText}>Route information not available</Text>
          </View>
        )}

        <View style={styles.busMetrics}>
          <View style={styles.metric}>
            <Navigation size={16} color={Colors.primary} />
            <Text style={styles.metricValue}>{bus.location.speed?.toFixed(0) || '0'} km/h</Text>
          </View>
          <View style={styles.metric}>
            <Clock size={16} color={Colors.gray[500]} />
            <Text style={styles.metricValue}>{getTimeSinceUpdate(bus.lastUpdate)}</Text>
          </View>
          {route && (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Stops: {route.stops.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.locationText}>
            {bus.location.latitude.toFixed(6)}, {bus.location.longitude.toFixed(6)}
          </Text>
          <ChevronRight size={20} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderStopsModal = () => {
    if (!selectedBus || !selectedBus.route) return null;

    const { bus, route } = selectedBus;
    const nearest = findNearestStop(bus, route.stops);

    return (
      <Modal
        visible={showStopsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStopsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Bus {bus.busId}</Text>
                <Text style={styles.modalSubtitle}>Route {route.routeNumber} - {route.routeName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStopsModal(false)}
                style={styles.closeButton}
              >
                <XCircle size={28} color={Colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <View style={styles.currentLocationSection}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              <View style={styles.locationCard}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.locationInfo}>
                  <Text style={styles.coordinatesText}>
                    {bus.location.latitude.toFixed(6)}, {bus.location.longitude.toFixed(6)}
                  </Text>
                  <View style={styles.locationMetrics}>
                    <Text style={styles.locationMetric}>Speed: {bus.location.speed?.toFixed(0) || 0} km/h</Text>
                    <Text style={styles.locationMetric}>•</Text>
                    <Text style={styles.locationMetric}>Heading: {bus.location.heading?.toFixed(0) || 0}°</Text>
                  </View>
                  {nearest && (
                    <Text style={styles.nearestStopText}>
                      Nearest: {nearest.stop.name} ({(nearest.distance * 1000).toFixed(0)}m away)
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.stopsSection}>
              <Text style={styles.sectionTitle}>Route Stops ({route.stops.length})</Text>
              <Text style={styles.stopInstructions}>Tap a stop to book your ticket</Text>
              <ScrollView style={styles.stopsList}>
                {route.stops.map((stop, index) => {
                  const distance = calculateDistance(
                    bus.location.latitude,
                    bus.location.longitude,
                    stop.location.coordinates[1],
                    stop.location.coordinates[0]
                  );
                  const isNearest = nearest?.stop.stopId === stop.stopId;

                  return (
                    <TouchableOpacity
                      key={stop.stopId}
                      style={[styles.stopCard, isNearest && styles.nearestStopCard]}
                      onPress={() => handleStopPress(stop, index)}
                      disabled={isNearest}
                    >
                      <View style={styles.stopNumber}>
                        <Text style={styles.stopNumberText}>{stop.order}</Text>
                      </View>
                      <View style={styles.stopDetails}>
                        <Text style={[styles.stopName, isNearest && styles.nearestStopName]}>
                          {stop.name}
                          {isNearest && ' 📍'}
                        </Text>
                        <Text style={styles.stopCoordinates}>
                          {stop.location.coordinates[1].toFixed(6)}, {stop.location.coordinates[0].toFixed(6)}
                        </Text>
                        <View style={styles.stopMetrics}>
                          <Text style={styles.stopMetric}>
                            {stop.estimatedTime} min from start
                          </Text>
                          <Text style={styles.stopMetric}>•</Text>
                          <Text style={styles.stopMetric}>
                            {(distance * 1000).toFixed(0)}m from bus
                          </Text>
                        </View>
                      </View>
                      {!isNearest && (
                        <CreditCard size={20} color={Colors.primary} style={styles.paymentIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.routeInfoSection}>
              <Text style={styles.routeInfoText}>
                Total Distance: {route.distance}km • Duration: {route.estimatedDuration}min
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading active buses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Buses</Text>
        <Text style={styles.subtitle}>{activeBuses.length} buses on the road</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeBuses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active buses found</Text>
            <Text style={styles.emptySubtext}>Pull to refresh</Text>
          </View>
        ) : (
          activeBuses.map(renderBusCard)
        )}
      </ScrollView>

      {renderStopsModal()}
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  busCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  routeBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  busDetails: {
    flex: 1,
  },
  busId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  routeName: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  routePoints: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 6,
    flex: 1,
  },
  noRouteText: {
    fontSize: 13,
    color: Colors.gray[500],
    fontStyle: 'italic',
  },
  busMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  locationText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  closeButton: {
    padding: 4,
  },
  currentLocationSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  locationMetrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  locationMetric: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  nearestStopText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  stopsSection: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  stopInstructions: {
    fontSize: 13,
    color: Colors.gray[600],
    marginBottom: 12,
    fontStyle: 'italic',
  },
  stopsList: {
    flex: 1,
  },
  stopCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  nearestStopCard: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  nearestStopName: {
    color: Colors.primary,
    fontWeight: '700',
  },
  stopCoordinates: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  stopMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  stopMetric: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  paymentIcon: {
    marginLeft: 8,
  },
  routeInfoSection: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  routeInfoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
