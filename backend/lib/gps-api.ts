import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { gpsTrackingService, GPSTrackingService } from './gps-tracking';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors());

// Driver Authentication & Registration Routes

// POST /api/driver/register - Register a new driver
app.post('/api/driver/register', async (c) => {
  try {
    const body = await c.req.json();
    const { name, phone, licenseNumber, busId, routeId, deviceId } = body;

    if (!name || !phone || !licenseNumber || !busId || !routeId || !deviceId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const driverId = `driver_${Date.now()}`;
    
    const newDriver = {
      driverId,
      name,
      phone,
      licenseNumber,
      busId,
      routeId,
      deviceId,
    };

    gpsTrackingService.registerDriver(newDriver);

    return c.json({
      success: true,
      driverId,
      message: 'Driver registered successfully'
    });
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// POST /api/driver/login - Authenticate driver
app.post('/api/driver/login', async (c) => {
  try {
    const body = await c.req.json();
    const { phone, deviceId } = body;

    if (!phone || !deviceId) {
      return c.json({ error: 'Phone and device ID required' }, 400);
    }

    const driver = gpsTrackingService.authenticateDriver(phone, deviceId);
    
    if (!driver) {
      return c.json({ error: 'Invalid credentials or device not registered' }, 401);
    }

    return c.json({
      success: true,
      driver: {
        driverId: driver.driverId,
        name: driver.name,
        busId: driver.busId,
        routeId: driver.routeId,
      }
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Location Tracking Routes

// POST /api/driver/location - Update driver location
app.post('/api/driver/location', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      driverId, 
      busId, 
      routeId, 
      latitude, 
      longitude, 
      heading, 
      speed, 
      accuracy,
      status 
    } = body;

    if (!driverId || !busId || !routeId || latitude === undefined || longitude === undefined) {
      return c.json({ error: 'Missing required location data' }, 400);
    }

    const locationData = {
      busId,
      routeId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      heading: heading || 0,
      speed: speed || 0,
      accuracy: accuracy || 0,
      status: status || 'active',
      timestamp: Date.now(),
    };

    // Validate location data
    if (!GPSTrackingService.validateLocation(locationData)) {
      return c.json({ error: 'Invalid location data' }, 400);
    }

    const success = gpsTrackingService.updateLocation(driverId, locationData);
    
    if (!success) {
      return c.json({ error: 'Driver not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Location updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({ error: 'Location update failed' }, 500);
  }
});

// GET /api/driver/location/:driverId - Get specific driver location
app.get('/api/driver/location/:driverId', (c) => {
  try {
    const driverId = c.req.param('driverId');
    const location = gpsTrackingService.getDriverLocation(driverId);
    
    if (!location) {
      return c.json({ error: 'Driver location not found' }, 404);
    }

    return c.json({
      success: true,
      location
    });
  } catch (error) {
    return c.json({ error: 'Failed to get location' }, 500);
  }
});

// Passenger Routes

// GET /api/buses/live - Get all active bus locations for passengers
app.get('/api/buses/live', (c) => {
  try {
    const locations = gpsTrackingService.getActiveBusLocations();
    
    return c.json({
      success: true,
      buses: locations.map(location => ({
        busId: location.busId,
        routeId: location.routeId,
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        status: location.status,
        lastUpdate: location.timestamp,
      })),
      count: locations.length,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({ error: 'Failed to get bus locations' }, 500);
  }
});

// GET /api/bus/:busId/location - Get specific bus location
app.get('/api/bus/:busId/location', (c) => {
  try {
    const busId = c.req.param('busId');
    const driver = gpsTrackingService.getDriverByBusId(busId);
    
    if (!driver || !driver.currentLocation) {
      return c.json({ error: 'Bus not found or offline' }, 404);
    }

    return c.json({
      success: true,
      bus: {
        busId: driver.busId,
        routeId: driver.routeId,
        driverName: driver.name,
        location: driver.currentLocation,
        isActive: driver.isActive,
        lastSeen: driver.lastSeen,
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to get bus location' }, 500);
  }
});

// GET /api/bus/:busId/history - Get bus location history
app.get('/api/bus/:busId/history', (c) => {
  try {
    const busId = c.req.param('busId');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const driver = gpsTrackingService.getDriverByBusId(busId);
    if (!driver) {
      return c.json({ error: 'Bus not found' }, 404);
    }

    const history = gpsTrackingService.getLocationHistory(driver.driverId, limit);
    
    return c.json({
      success: true,
      busId,
      history: history.map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        status: location.status,
        timestamp: location.timestamp,
      })),
      count: history.length
    });
  } catch (error) {
    return c.json({ error: 'Failed to get location history' }, 500);
  }
});

// Admin Routes

// GET /api/admin/drivers - Get all registered drivers
app.get('/api/admin/drivers', (c) => {
  try {
    const drivers = gpsTrackingService.getAllDrivers();
    
    return c.json({
      success: true,
      drivers: drivers.map(driver => ({
        driverId: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        busId: driver.busId,
        routeId: driver.routeId,
        isActive: driver.isActive,
        lastSeen: driver.lastSeen,
        hasCurrentLocation: !!driver.currentLocation,
      })),
      count: drivers.length
    });
  } catch (error) {
    return c.json({ error: 'Failed to get drivers' }, 500);
  }
});

// DELETE /api/admin/driver/:driverId - Remove driver
app.delete('/api/admin/driver/:driverId', (c) => {
  try {
    const driverId = c.req.param('driverId');
    const success = gpsTrackingService.removeDriver(driverId);
    
    if (!success) {
      return c.json({ error: 'Driver not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Driver removed successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to remove driver' }, 500);
  }
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'GPS Tracking API is running',
    timestamp: Date.now(),
    activeDrivers: gpsTrackingService.getAllDrivers().filter(d => d.isActive).length,
    totalDrivers: gpsTrackingService.getAllDrivers().length,
  });
});

export default app;