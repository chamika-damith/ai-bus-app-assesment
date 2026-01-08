import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronDown, Search, MapPin } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { getAPIClient } from '../../lib/api';

const ROLES = [
  { label: 'Passenger', value: 'PASSENGER' as UserRole },
  { label: 'Driver', value: 'DRIVER' as UserRole },
];

interface Route {
  routeId: string;
  routeNumber: string;
  routeName: string;
  startPoint: { name: string };
  endPoint: { name: string };
  distance: number;
  color: string;
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'PASSENGER' as UserRole,
    deviceId: '',
    // Driver-specific fields
    nic: '',
    route: '',
    vehicleNumber: '',
    // Passenger-specific fields (telephone is same as phone)
  });
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showRoutePicker, setShowRoutePicker] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const { register } = useAuth();

  // Fetch routes when driver role is selected
  useEffect(() => {
    if (formData.role === 'DRIVER') {
      fetchRoutes();
    }
  }, [formData.role]);

  // Filter routes based on search query
  useEffect(() => {
    if (!routeSearchQuery) {
      setFilteredRoutes(routes);
    } else {
      const query = routeSearchQuery.toLowerCase();
      const filtered = routes.filter(
        (route) =>
          route.routeNumber.toLowerCase().includes(query) ||
          route.routeName.toLowerCase().includes(query) ||
          route.startPoint.name.toLowerCase().includes(query) ||
          route.endPoint.name.toLowerCase().includes(query)
      );
      setFilteredRoutes(filtered);
    }
  }, [routeSearchQuery, routes]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const apiClient = getAPIClient();
      const data = await apiClient.getRoutes();
      
      if (data && data.length > 0) {
        setRoutes(data);
        setFilteredRoutes(data);
      } else {
        console.warn('No routes available');
        setRoutes([]);
        setFilteredRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Could not load routes. Please check your connection and try again.');
      setRoutes([]);
      setFilteredRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    updateFormData('route', route.routeNumber);
    setShowRoutePicker(false);
    setRouteSearchQuery('');
  };

  const handleRegister = async () => {
    // Common field validation
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Role-specific validation
    if (formData.role === 'DRIVER') {
      if (!formData.phone || !formData.nic || !formData.route || !formData.vehicleNumber) {
        Alert.alert('Error', 'Please fill in all driver fields: Phone, NIC, Route, and Vehicle Number');
        return;
      }
    } else if (formData.role === 'PASSENGER') {
      if (!formData.phone || !formData.nic) {
        Alert.alert('Error', 'Please fill in all passenger fields: Phone and NIC');
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        nic: formData.nic,
        route: formData.role === 'DRIVER' ? formData.route : undefined,
        routeId: formData.role === 'DRIVER' && selectedRoute ? selectedRoute.routeId : undefined,
        routeName: formData.role === 'DRIVER' && selectedRoute ? selectedRoute.routeName : undefined,
        vehicleNumber: formData.role === 'DRIVER' ? formData.vehicleNumber : undefined,
      };

      // Only add deviceId if user entered one
      if (formData.deviceId && formData.deviceId.trim() !== '') {
        registrationData.deviceId = formData.deviceId.trim();
      }

      await register(registrationData);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedRole = ROLES.find(role => role.value === formData.role);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join RideShare today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name *"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Enter your full name"
            autoComplete="name"
          />

          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Role *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <Text style={styles.pickerText}>{selectedRole?.label}</Text>
              <ChevronDown size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            
            {showRolePicker && (
              <View style={styles.pickerOptions}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      updateFormData('role', role.value);
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{role.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Input
            label="Password *"
            type="password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            placeholder="Enter your password"
            autoComplete="new-password"
          />

          {/* Common Fields */}
          <Input
            label="Phone Number *"
            type="phone"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter your phone number"
            autoComplete="tel"
          />

          <Input
            label="Device ID"
            value={formData.deviceId}
            onChangeText={(value) => updateFormData('deviceId', value)}
            placeholder="Optional: Enter device ID"
          />

          <Input
            label="NIC (National Identity Card) *"
            value={formData.nic}
            onChangeText={(value) => updateFormData('nic', value)}
            placeholder="Enter your NIC number"
          />

          {/* Driver-Specific Fields */}
          {formData.role === 'DRIVER' && (
            <>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Route * {loadingRoutes && '(Loading...)'}</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowRoutePicker(!showRoutePicker)}
                >
                  {selectedRoute ? (
                    <View style={styles.routeDisplay}>
                      <View style={styles.routeInfo}>
                        <Text style={styles.routeNumber}>{selectedRoute.routeNumber}</Text>
                        <Text style={styles.routeText}>{selectedRoute.routeName}</Text>
                      </View>
                      <ChevronDown size={20} color={Colors.gray[400]} />
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.pickerText, { color: Colors.gray[400] }]}>
                        Select or search route
                      </Text>
                      <ChevronDown size={20} color={Colors.gray[400]} />
                    </>
                  )}
                </TouchableOpacity>
                
                {showRoutePicker && (
                  <View style={styles.routePickerModal}>
                    <View style={styles.searchContainer}>
                      <Search size={18} color={Colors.gray[400]} style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search by route number or name"
                        placeholderTextColor={Colors.gray[400]}
                        value={routeSearchQuery}
                        onChangeText={setRouteSearchQuery}
                        autoFocus
                      />
                    </View>
                    
                    {loadingRoutes ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                      </View>
                    ) : filteredRoutes.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                          {routeSearchQuery ? 'No routes found' : 'No routes available'}
                        </Text>
                        <TouchableOpacity
                          style={styles.manualEntryButton}
                          onPress={() => {
                            setShowRoutePicker(false);
                            Alert.alert(
                              'Manual Entry',
                              'Enter route number manually',
                              [
                                {
                                  text: 'OK',
                                  onPress: () => {
                                    // Allow manual entry
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={styles.manualEntryText}>Enter Manually</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <FlatList
                        data={filteredRoutes}
                        keyExtractor={(item) => item.routeId}
                        style={styles.routeList}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.routeItem}
                            onPress={() => handleRouteSelect(item)}
                          >
                            <View style={styles.routeItemHeader}>
                              <View style={[styles.routeBadge, { backgroundColor: item.color + '20' }]}>
                                <Text style={[styles.routeBadgeText, { color: item.color }]}>
                                  {item.routeNumber}
                                </Text>
                              </View>
                              <Text style={styles.routeDistance}>{item.distance}km</Text>
                            </View>
                            <Text style={styles.routeItemName}>{item.routeName}</Text>
                            <View style={styles.routePoints}>
                              <MapPin size={12} color={Colors.gray[500]} />
                              <Text style={styles.routePointText}>
                                {item.startPoint.name} → {item.endPoint.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>
                )}
              </View>

              <Input
                label="Vehicle Number *"
                value={formData.vehicleNumber}
                onChangeText={(value) => updateFormData('vehicleNumber', value)}
                placeholder="e.g., WP CAB-1234"
              />
            </>
          )}

          <Input
            label="Confirm Password *"
            type="password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('/auth/login')}
            >
              Sign In
            </Text>
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    marginBottom: 40,
  },
  pickerContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  pickerOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  routeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  routeInfo: {
    flex: 1,
  },
  routeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  routePickerModal: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 400,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.gray[50],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    padding: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  manualEntryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  manualEntryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  routeList: {
    maxHeight: 320,
  },
  routeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  routeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  routeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  routeDistance: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  routeItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  routePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routePointText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
  },
});