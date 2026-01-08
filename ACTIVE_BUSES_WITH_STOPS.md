# Passenger Active Buses with Route Stops Display

## Overview
A comprehensive passenger screen that displays all active buses with their routes and detailed stop information. When clicking on a bus, passengers can view its current GPS location matched against all bus stops on that route.

## Features Implemented

### 1. Active Buses List View
- **Display All Active Buses**: Shows all currently running buses in the system
- **Route Information**: Each bus displays its assigned route number and name
- **Real-time Status**: Active, Idle, or Offline status with color coding
- **Live Metrics**: 
  - Current speed (km/h)
  - Time since last update
  - Number of stops on route
- **Current Location**: GPS coordinates displayed for each bus
- **Auto-Refresh**: Updates every 10 seconds automatically
- **Pull to Refresh**: Manual refresh capability

### 2. Bus Details Modal
When clicking on any bus, a detailed modal displays:

#### Current Location Section
- **GPS Coordinates**: Exact latitude and longitude
- **Speed & Heading**: Current movement metrics
- **Nearest Stop**: Automatically calculated and highlighted
- **Distance to Nearest Stop**: Real-time calculation in meters

#### Route Stops Section
- **All Stops Listed**: Complete list of stops on the route
- **Stop Details**:
  - Stop name
  - GPS coordinates (latitude, longitude)
  - Order in route sequence
  - Estimated time from start point
  - Distance from bus's current location
- **Nearest Stop Highlighted**: Visual indicator with pin emoji 📍
- **Color Coding**: Nearest stop has distinctive styling

#### Route Summary
- Total route distance
- Estimated journey duration
- Start and end points

### 3. Distance Calculation
- **Haversine Formula**: Accurate distance calculation between GPS points
- **Real-time Updates**: Distances recalculate as bus moves
- **Meter Precision**: Shows distance in meters for accuracy
- **Nearest Stop Detection**: Automatically identifies closest stop

## File Structure

### Frontend
**File**: `/app/passenger/active-buses.tsx`

**Key Components**:
1. `ActiveBusesScreen` - Main component
2. `BusCard` - Individual bus display
3. `StopsModal` - Detailed bus information modal

**State Management**:
```typescript
- loading: boolean
- refreshing: boolean
- activeBuses: BusWithRoute[]
- selectedBus: BusWithRoute | null
- showStopsModal: boolean
- routes: Map<string, RouteDetails>
```

**Key Functions**:
- `loadData()` - Fetch buses and routes
- `handleBusPress()` - Show bus details
- `calculateDistance()` - Haversine distance calculation
- `findNearestStop()` - Identify closest stop to bus
- `getTimeSinceUpdate()` - Format timestamp

### Backend APIs Used

#### 1. Get Active Routes
```
GET /api/routes?active=true
```
Returns all active routes with:
- Route ID, number, name
- Start and end points with coordinates
- Complete stops array with coordinates
- Distance and duration
- Color for UI display

#### 2. Get Live Buses
```
GET /api/gps/buses/live
```
Returns all active buses with:
- Bus ID, route ID, driver ID
- Current GPS location
- Speed, heading, status
- Last update timestamp

## Data Flow

```
1. Screen Loads
   ↓
2. Fetch Routes from /api/routes
   ↓
3. Build Routes Map (routeNumber → RouteDetails)
   ↓
4. Fetch Active Buses from /api/gps/buses/live
   ↓
5. Match Each Bus with Route
   ↓
6. Display Buses with Route Info
   ↓
7. User Clicks Bus
   ↓
8. Show Modal with:
   - Current GPS Location
   - Calculate Distance to Each Stop
   - Highlight Nearest Stop
   ↓
9. Auto-refresh every 10 seconds
```

## UI Components

### Bus Card Design
```
┌─────────────────────────────────────────┐
│ [138] Bus WP-CAB-1234                   │
│       Colombo - Kandy              ●Active│
│                                          │
│ 📍 Colombo Fort → Kandy Central        │
│                                          │
│ 🧭 45 km/h  🕐 2m ago  Stops: 6         │
│                                          │
│ 6.9271, 79.8612                    →    │
└─────────────────────────────────────────┘
```

### Stops Modal Design
```
┌─────────────────────────────────────────┐
│ Bus WP-CAB-1234                      ✕  │
│ Route 138 - Colombo - Kandy            │
├─────────────────────────────────────────┤
│ Current Location                        │
│ ┌─────────────────────────────────────┐ │
│ │ 📍 6.9271, 79.8612                  │ │
│ │ Speed: 45 km/h • Heading: 90°      │ │
│ │ Nearest: Pettah Central (250m)     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Route Stops (6)                         │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 1  Colombo Fort                     │ │
│ │    6.9271, 79.8612                  │ │
│ │    0 min from start • 500m from bus│ │
│ ├─────────────────────────────────────┤ │
│ │ 2  Pettah Central 📍                │ │ ← Nearest
│ │    6.9300, 79.8650                  │ │
│ │    10 min from start • 250m from bus│ │
│ ├─────────────────────────────────────┤ │
│ │ 3  Maradana                         │ │
│ │    6.9350, 79.8700                  │ │
│ │    15 min from start • 800m from bus│ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Total: 115km • Duration: 180min        │
└─────────────────────────────────────────┘
```

## Distance Calculation Algorithm

### Haversine Formula
Calculates the great-circle distance between two points on Earth:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Returns distance in kilometers
}
```

**Accuracy**: Within ±0.5% for most routes

### Nearest Stop Detection
```javascript
function findNearestStop(busLocation, stops) {
  let nearestStop = stops[0];
  let minDistance = calculateDistance(
    busLocation.latitude,
    busLocation.longitude,
    stops[0].location.coordinates[1],
    stops[0].location.coordinates[0]
  );

  stops.forEach(stop => {
    const distance = calculateDistance(
      busLocation.latitude,
      busLocation.longitude,
      stop.location.coordinates[1],
      stop.location.coordinates[0]
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = stop;
    }
  });

  return { stop: nearestStop, distance: minDistance };
}
```

## Coordinate System

### GeoJSON Format
All coordinates use GeoJSON standard:
- **Format**: `[longitude, latitude]`
- **Note**: Longitude first, then latitude (opposite of common usage)

### Display Format
For user display:
- **Format**: `latitude, longitude`
- **Precision**: 6 decimal places (±0.11m accuracy)

### Conversion
```javascript
// GeoJSON to Display
const [lon, lat] = stop.location.coordinates;
// Display: `${lat}, ${lon}`

// Display to GeoJSON
const latitude = parseFloat(input.split(',')[0]);
const longitude = parseFloat(input.split(',')[1]);
// GeoJSON: [longitude, latitude]
```

## Status Color Coding

```javascript
Active:  Green  (#10B981) - Bus is moving
Idle:    Yellow (#F59E0B) - Bus is stopped
Offline: Gray   (#9CA3AF) - No recent updates
```

## Auto-Refresh Strategy

### Implementation
```javascript
useEffect(() => {
  loadData(); // Initial load
  
  const interval = setInterval(() => {
    loadData(true); // Silent refresh
  }, 10000); // 10 seconds

  return () => clearInterval(interval);
}, []);
```

### Benefits
- **Real-time Updates**: Location updates every 10 seconds
- **Battery Efficient**: Only when screen is active
- **Silent Refresh**: No loading indicators on auto-refresh
- **Manual Override**: Pull-to-refresh always available

## Navigation

### From Passenger Home
```typescript
router.push('/passenger/active-buses')
```

### Quick Action Button
Added to passenger home screen:
```
┌──────────────────────────────┐
│ 🔍 Active Buses              │
│ View all live buses          │
└──────────────────────────────┘
```

## Performance Considerations

### Optimization Techniques
1. **Map-based Route Lookup**: O(1) route matching
2. **Memoized Distance Calculations**: Cache results
3. **Virtual Scrolling**: For large stop lists
4. **Debounced Refresh**: Prevent spam refreshes
5. **Conditional Rendering**: Only render visible items

### Data Size
- Average route: ~10-15 stops
- Average bus list: 5-20 buses
- Update frequency: 10 seconds
- Data per update: ~50-100KB

## Error Handling

### No Routes Available
```
⚠️ No routes found
Please ensure routes are seeded
```

### No Active Buses
```
No active buses found
Pull to refresh
```

### Network Error
```
Failed to load data
Pull to refresh to try again
```

## Testing

### Test Script
**File**: `/BusTracking-Backend/test-active-buses-with-stops.js`

**Tests**:
1. ✅ Routes API availability
2. ✅ Routes data structure
3. ✅ Buses API availability
4. ✅ Bus-to-route matching
5. ✅ Stop coordinates format
6. ✅ Distance calculation accuracy
7. ✅ Nearest stop detection

**Run Tests**:
```bash
cd BusTracking-Backend
node test-active-buses-with-stops.js
```

## User Journey

### Viewing Active Buses
1. Navigate to Passenger Home
2. Click "Active Buses" button
3. View list of all active buses
4. See route, status, speed, location
5. Pull to refresh for latest data

### Viewing Bus Details
1. Click on any bus card
2. Modal opens with detailed information
3. See current GPS location
4. View all stops on route
5. Nearest stop is highlighted
6. See distance to each stop
7. Close modal or tap outside

### Understanding Stop Information
1. Stops are ordered sequentially
2. Each stop shows:
   - Name
   - Coordinates
   - Time from route start
   - Distance from bus
3. Nearest stop is visually distinct
4. Distance updates as bus moves

## Integration with Existing Features

### Works With
- ✅ Route Management System
- ✅ GPS Tracking System
- ✅ Driver Authentication
- ✅ Real-time Location Updates
- ✅ Session Management

### Data Sources
- Routes: `/api/routes` endpoint
- Buses: `/api/gps/buses/live` endpoint
- Stops: Embedded in route data

## Future Enhancements

### Potential Features
1. **Map View**: Display buses and stops on interactive map
2. **ETA Calculation**: Predict arrival time at each stop
3. **Notifications**: Alert when bus is nearby
4. **Favorites**: Save frequently used routes
5. **History**: Track past bus journeys
6. **Filtering**: Filter by route, status, or area
7. **Search**: Search for specific buses or routes
8. **Directions**: Get directions to nearest stop

## Summary

This implementation provides passengers with:
- ✅ Complete visibility of all active buses
- ✅ Detailed route and stop information
- ✅ Real-time GPS tracking
- ✅ Distance calculations to all stops
- ✅ Automatic nearest stop detection
- ✅ User-friendly interface
- ✅ Auto-refresh capability
- ✅ Comprehensive stop data display

The system is production-ready and fully integrated with the existing backend infrastructure.
