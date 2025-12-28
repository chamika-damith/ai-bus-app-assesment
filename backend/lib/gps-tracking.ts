import { WebSocket } from 'ws';

export interface DriverLocation {
  driverId: string;
  busId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: number;
  status: 'active' | 'idle' | 'offline';
}

export interface RegisteredDriver {
  driverId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  busId: string;
  routeId: string;
  deviceId: string; // Unique device identifier
  isActive: boolean;
  lastSeen: number;
  currentLocation?: DriverLocation;
}

export class GPSTrackingService {
  private drivers: Map<string, RegisteredDriver> = new Map();
  private locations: Map<string, DriverLocation> = new Map();
  private wsConnections: Map<string, WebSocket> = new Map();
  private locationHistory: Map<string, DriverLocation[]> = new Map();

  constructor() {
    // Initialize with some mock registered drivers
    this.initializeMockDrivers();
  }

  private initializeMockDrivers() {
    const mockDrivers: RegisteredDriver[] = [
      {
        driverId: 'driver_001',
        name: 'Kamal Perera',
        phone: '+94771234567',
        licenseNumber: 'DL001234',
        busId: 'bus_138_01',
        routeId: 'route_138',
        deviceId: 'device_android_001',
        isActive: true,
        lastSeen: Date.now(),
      },
      {
        driverId: 'driver_002',
        name: 'Sunil Silva',
        phone: '+94771234568',
        licenseNumber: 'DL001235',
        busId: 'bus_177_01',
        routeId: 'route_177',
        deviceId: 'device_android_002',
        isActive: true,
        lastSeen: Date.now(),
      },
      {
        driverId: 'driver_003',
        name: 'Nimal Fernando',
        phone: '+94771234569',
        licenseNumber: 'DL001236',
        busId: 'bus_245_01',
        routeId: 'route_245',
        deviceId: 'device_android_003',
        isActive: true,
        lastSeen: Date.now(),
      }
    ];

    mockDrivers.forEach(driver => {
      this.drivers.set(driver.driverId, driver);
    });
  }

  // Register a new driver
  registerDriver(driver: Omit<RegisteredDriver, 'isActive' | 'lastSeen'>): string {
    const newDriver: RegisteredDriver = {
      ...driver,
      isActive: false,
      lastSeen: Date.now(),
    };
    
    this.drivers.set(driver.driverId, newDriver);
    this.locationHistory.set(driver.driverId, []);
    
    return driver.driverId;
  }

  // Authenticate driver by phone and device ID
  authenticateDriver(phone: string, deviceId: string): RegisteredDriver | null {
    for (const driver of this.drivers.values()) {
      if (driver.phone === phone && driver.deviceId === deviceId) {
        driver.isActive = true;
        driver.lastSeen = Date.now();
        this.drivers.set(driver.driverId, driver);
        return driver;
      }
    }
    return null;
  }

  // Update driver location
  updateLocation(driverId: string, location: Omit<DriverLocation, 'driverId'>): boolean {
    const driver = this.drivers.get(driverId);
    if (!driver) return false;

    const fullLocation: DriverLocation = {
      driverId,
      ...location,
      timestamp: Date.now(),
    };

    // Update current location
    this.locations.set(driverId, fullLocation);
    
    // Update driver's last seen
    driver.lastSeen = Date.now();
    driver.currentLocation = fullLocation;
    this.drivers.set(driverId, driver);

    // Add to history (keep last 100 locations)
    const history = this.locationHistory.get(driverId) || [];
    history.push(fullLocation);
    if (history.length > 100) {
      history.shift();
    }
    this.locationHistory.set(driverId, history);

    // Broadcast to connected passengers
    this.broadcastLocationUpdate(fullLocation);

    return true;
  }

  // Get all active bus locations for passengers
  getActiveBusLocations(): DriverLocation[] {
    const activeLocations: DriverLocation[] = [];
    const now = Date.now();
    
    for (const driver of this.drivers.values()) {
      if (driver.isActive && driver.currentLocation) {
        // Consider driver offline if no update in 2 minutes
        const isOnline = (now - driver.lastSeen) < 120000;
        if (isOnline) {
          activeLocations.push({
            ...driver.currentLocation,
            status: driver.currentLocation.status,
          });
        }
      }
    }
    
    return activeLocations;
  }

  // Get specific driver location
  getDriverLocation(driverId: string): DriverLocation | null {
    return this.locations.get(driverId) || null;
  }

  // Get driver by bus ID
  getDriverByBusId(busId: string): RegisteredDriver | null {
    for (const driver of this.drivers.values()) {
      if (driver.busId === busId) {
        return driver;
      }
    }
    return null;
  }

  // Get location history for a driver
  getLocationHistory(driverId: string, limit: number = 50): DriverLocation[] {
    const history = this.locationHistory.get(driverId) || [];
    return history.slice(-limit);
  }

  // WebSocket connection management
  addWebSocketConnection(driverId: string, ws: WebSocket) {
    this.wsConnections.set(driverId, ws);
    
    ws.on('close', () => {
      this.wsConnections.delete(driverId);
      // Mark driver as offline after connection closes
      const driver = this.drivers.get(driverId);
      if (driver) {
        driver.isActive = false;
        this.drivers.set(driverId, driver);
      }
    });
  }

  // Broadcast location update to all connected passengers
  private broadcastLocationUpdate(location: DriverLocation) {
    // This would broadcast to passenger apps via WebSocket
    // For now, we'll just log it
    console.log(`Broadcasting location update for driver ${location.driverId}:`, {
      busId: location.busId,
      routeId: location.routeId,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      status: location.status,
    });
  }

  // Generate unique device ID for new installations
  static generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Validate location data
  static validateLocation(location: Partial<DriverLocation>): boolean {
    return !!(
      location.latitude &&
      location.longitude &&
      location.latitude >= -90 && location.latitude <= 90 &&
      location.longitude >= -180 && location.longitude <= 180 &&
      location.accuracy !== undefined &&
      location.accuracy >= 0
    );
  }

  // Calculate distance between two points (Haversine formula)
  static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get all registered drivers (admin function)
  getAllDrivers(): RegisteredDriver[] {
    return Array.from(this.drivers.values());
  }

  // Remove driver (admin function)
  removeDriver(driverId: string): boolean {
    const removed = this.drivers.delete(driverId);
    this.locations.delete(driverId);
    this.locationHistory.delete(driverId);
    
    const ws = this.wsConnections.get(driverId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(driverId);
    }
    
    return removed;
  }
}

// Singleton instance
export const gpsTrackingService = new GPSTrackingService();