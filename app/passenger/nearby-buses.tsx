import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, List, Filter, RefreshCw, Users } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

interface NearbyBus {
  id: string;
  routeNumber: string;
  direction: string;
  distanceFromUser: number;
  crowdLevel: 'low' | 'medium' | 'high';
  arrivalTime: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

const mockNearbyBuses: NearbyBus[] = [
  {
    id: '1',
    routeNumber: '119',
    direction: 'To Pettah',
    distanceFromUser: 0.3,
    crowdLevel: 'low',
    arrivalTime: '2 min',
    location: { latitude: 6.9271, longitude: 79.8612 }
  },
  {
    id: '2',
    routeNumber: '129',
    direction: 'To Ratnapura',
    distanceFromUser: 0.5,
    crowdLevel: 'medium',
    arrivalTime: '5 min',
    location: { latitude: 6.9281, longitude: 79.8622 }
  },
  {
    id: '3',
    routeNumber: '138',
    direction: 'To Nugegoda',
    distanceFromUser: 0.8,
    crowdLevel: 'high',
    arrivalTime: '8 min',
    location: { latitude: 6.9291, longitude: 79.8632 }
  },
  {
    id: '4',
    routeNumber: '280',
    direction: 'To Horana',
    distanceFromUser: 1.2,
    crowdLevel: 'low',
    arrivalTime: '12 min',
    location: { latitude: 6.9301, longitude: 79.8642 }
  },
  {
    id: '5',
    routeNumber: '177',
    direction: 'To Maharagama',
    distanceFromUser: 1.5,
    crowdLevel: 'medium',
    arrivalTime: '15 min',
    location: { latitude: 6.9311, longitude: 79.8652 }
  }
];

export default function NearbyBuses() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [buses, setBuses] = useState<NearbyBus[]>(mockNearbyBuses);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleBusPress = (bus: NearbyBus) => {
    router.push(`/passenger/bus-tracking?busId=${bus.id}`);
  };

  const filteredBuses = buses.filter(bus => {
    if (selectedFilter === 'all') return true;
    return bus.routeNumber === selectedFilter;
  });

  const sortedBuses = filteredBuses.sort((a, b) => a.distanceFromUser - b.distanceFromUser);

  const renderBusCard = ({ item }: { item: NearbyBus }) => (
    <TouchableOpacity 
      style={styles.busCard}
      onPress={() => handleBusPress(item)}
    >
      <View style={styles.busCardHeader}>
        <View style={styles.routeNumberBadge}>
          <Text style={styles.routeNumber}>{item.routeNumber}</Text>
        </View>
        <View style={styles.busInfo}>
          <Text style={styles.busDirection}>{item.direction}</Text>
          <Text style={styles.busDistance}>{item.distanceFromUser.toFixed(1)} km away</Text>
        </View>
        <View style={styles.busStatus}>
          <Text style={styles.arrivalTime}>{item.arrivalTime}</Text>
          <View style={styles.crowdIndicator}>
            <Users size={16} color={getCrowdLevelColor(item.crowdLevel)} />
            <Text style={[styles.crowdText, { color: getCrowdLevelColor(item.crowdLevel) }]}>
              {getCrowdLevelText(item.crowdLevel)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Nearby Buses</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <RefreshCw 
            size={24} 
            color={Colors.primary} 
            style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
            onPress={() => setViewMode('map')}
          >
            <MapPin size={20} color={viewMode === 'map' ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <List size={20} color={viewMode === 'list' ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
              List
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.text.secondary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color={Colors.primary} />
            <Text style={styles.mapText}>Nearby Buses Map</Text>
            <Text style={styles.mapSubtext}>
              Showing {sortedBuses.length} buses within 2km
            </Text>
            
            {/* Map overlay with bus count */}
            <View style={styles.mapOverlay}>
              <Text style={styles.busCountText}>{sortedBuses.length} buses nearby</Text>
            </View>
          </View>
          
          {/* Bottom sheet with bus list */}
          <View style={styles.mapBottomSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Nearby Buses</Text>
            <FlatList
              data={sortedBuses}
              renderItem={renderBusCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.busList}
            />
          </View>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {sortedBuses.length} buses found within 2km
            </Text>
            <Text style={styles.listSubtitle}>Sorted by distance</Text>
          </View>
          
          <FlatList
            data={sortedBuses}
            renderItem={renderBusCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.busList}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </View>
      )}
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
  refreshButton: {
    padding: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  activeToggle: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeToggleText: {
    color: Colors.white,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  mapContainer: {
    flex: 1,
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
  mapOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  mapBottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '50%',
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
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  listSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  busList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  busCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeNumberBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  routeNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  busInfo: {
    flex: 1,
  },
  busDirection: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  busDistance: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  busStatus: {
    alignItems: 'flex-end',
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  crowdIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crowdText: {
    fontSize: 12,
    fontWeight: '500',
  },
});