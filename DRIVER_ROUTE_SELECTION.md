# Driver Route Selection Feature

## Overview
Enhanced driver registration with searchable route selection from the database. Drivers can now select their assigned route from a dropdown list with search functionality.

## Implementation Summary

### Backend Changes

#### 1. Database Models Updated

**Driver Model** (`/BusTracking-Backend/models/Driver.js`)
- Added `routeId` field (string, indexed) - References BusRoute.routeId
- Added `routeName` field (string) - Stores full route name for easy access
- Existing `route` field retained for backward compatibility

**DriverSession Model** (`/BusTracking-Backend/models/DriverSession.js`)
- Added `routeName` field (string) - Stores route name in active sessions

**DriverLocation Model** (`/BusTracking-Backend/models/DriverLocation.js`)
- Added `routeName` field (string) - Tracks route name with GPS locations

#### 2. Controllers Updated

**GPS Controller** (`/BusTracking-Backend/controllers/gpsController.js`)

**registerDriver endpoint:**
- Now accepts `routeName` parameter
- Stores both `routeId` and `routeName` in Driver model
- Example request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0771234567",
  "licenseNumber": "NIC123456789",
  "busId": "WP-CAB-1234",
  "routeId": "138",
  "routeName": "Colombo - Kandy"
}
```

**loginDriver endpoint:**
- Session creation includes `routeName` from driver record
- Returns route information in login response

**updateLocation endpoint:**
- Location records include `routeName` from session

#### 3. Services Updated

**GPS Processing Service** (`/BusTracking-Backend/services/gpsProcessingService.js`)
- `storeLocationData()` now saves `routeName` with location records
- Uses session's routeName or falls back to locationData.routeName

### Frontend Changes

#### Registration Screen (`/app/auth/register.tsx`)

**New Features:**
1. **Route Dropdown with Search**
   - Fetches active routes from `/api/routes?active=true`
   - Real-time search filtering by:
     - Route number
     - Route name
     - Start point name
     - End point name
   - Displays route information:
     - Route number badge with color
     - Route name
     - Start → End points
     - Distance

2. **Visual Components**
   - Search input with icon
   - Loading indicator while fetching routes
   - Empty state with manual entry option
   - Route cards with detailed information
   - Selected route display

3. **User Experience**
   - Auto-loads routes on component mount
   - Instant search filtering
   - Clear visual feedback
   - Manual entry fallback if no routes found

**New State Variables:**
```typescript
const [showRoutePicker, setShowRoutePicker] = useState(false);
const [routes, setRoutes] = useState<Route[]>([]);
const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
const [routeSearchQuery, setRouteSearchQuery] = useState('');
const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
const [loadingRoutes, setLoadingRoutes] = useState(false);
```

**Registration Data Sent:**
```typescript
{
  name: string,
  email: string,
  password: string,
  role: 'DRIVER',
  phone: string,
  nic: string,
  route: string,           // Route number (e.g., "138")
  routeId: string,         // Route ID (e.g., "route_138")
  routeName: string,       // Full name (e.g., "Colombo - Kandy")
  vehicleNumber: string
}
```

### API Integration

**Get Routes:**
```typescript
const response = await apiClient.get('/routes?active=true');
// Returns: { success: true, count: 5, data: [...routes] }
```

**Register Driver:**
```typescript
const registrationData = {
  name: formData.name,
  email: formData.email,
  password: formData.password,
  role: formData.role,
  phone: formData.phone,
  nic: formData.nic,
  route: formData.route,
  routeId: selectedRoute.routeId,
  routeName: selectedRoute.routeName,
  vehicleNumber: formData.vehicleNumber
};
```

## Usage Flow

### 1. Driver Registration
1. User selects "Driver" role
2. Fills basic information (name, email, password, etc.)
3. **Clicks on Route field**
   - Dropdown opens showing all active routes
   - Can search by typing route number/name
   - Selects desired route from list
4. Enters vehicle number
5. Submits registration

### 2. Route Selection Experience
```
┌─────────────────────────────────────────┐
│ Route *                                 │
│ ┌─────────────────────────────────────┐ │
│ │ 138                                 │ │
│ │ Colombo - Kandy               ▼    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
        ↓ (Dropdown opens)
┌─────────────────────────────────────────┐
│ 🔍 Search by route number or name      │
├─────────────────────────────────────────┤
│ ┌─────┐                          115km │
│ │ 138 │ Colombo - Kandy                │
│ └─────┘ 📍 Colombo Fort → Kandy...    │
├─────────────────────────────────────────┤
│ ┌─────┐                          119km │
│ │ 177 │ Colombo - Galle                │
│ └─────┘ 📍 Colombo Central → Galle...│
├─────────────────────────────────────────┤
│ ┌─────┐                           38km │
│ │ 245 │ Colombo - Negombo              │
│ └─────┘ 📍 Colombo Pettah → Negom...│
└─────────────────────────────────────────┘
```

### 3. Data Flow
```
Frontend (Register Screen)
    ↓
Load Routes: GET /api/routes?active=true
    ↓
User Selects Route
    ↓
Submit Registration: POST /api/gps/driver/register
  {
    route: "138",
    routeId: "route_138",
    routeName: "Colombo - Kandy"
  }
    ↓
Backend Creates Driver Record
    ↓
MongoDB Driver Document:
  {
    route: "138",
    routeId: "route_138",
    routeName: "Colombo - Kandy",
    ...
  }
    ↓
Driver Logs In
    ↓
Session Created with Route Info
    ↓
GPS Tracking with Route Data
```

## Benefits

### 1. Data Consistency
- Route information standardized across system
- Single source of truth (BusRoute collection)
- No manual typos in route names

### 2. Better UX
- Easy to find routes with search
- Visual route information
- Clear start/end points
- Distance information

### 3. Enhanced Tracking
- Route name stored with GPS locations
- Easy filtering of buses by route
- Better analytics and reporting

### 4. Scalability
- New routes automatically available
- Central route management
- Easy to update route information

## Testing

**Test Script:** `/BusTracking-Backend/test-driver-route-registration.js`

Run:
```bash
cd BusTracking-Backend
node test-driver-route-registration.js
```

**Test Coverage:**
1. ✅ Fetch active routes from database
2. ✅ Register driver with route selection
3. ✅ Verify MongoDB storage (route, routeId, routeName)
4. ✅ Login with route information
5. ✅ Session creation with route data
6. ✅ Location tracking with route
7. ✅ Query buses by route

**Test Results:**
```
✅ All tests completed successfully!

Route Selection Features Verified:
  ✓ Route selection from database
  ✓ Driver registration with routeId and routeName
  ✓ MongoDB storage with route fields
  ✓ Session creation with route information
  ✓ Location tracking with route data
  ✓ Live bus tracking by route
```

## Files Modified

### Backend:
1. `/BusTracking-Backend/models/Driver.js` - Added routeId and routeName fields
2. `/BusTracking-Backend/models/DriverSession.js` - Added routeName field
3. `/BusTracking-Backend/models/DriverLocation.js` - Added routeName field
4. `/BusTracking-Backend/controllers/gpsController.js` - Updated registration and session logic
5. `/BusTracking-Backend/services/gpsProcessingService.js` - Updated location storage

### Frontend:
1. `/app/auth/register.tsx` - Added searchable route picker with complete UI

### Testing:
1. `/BusTracking-Backend/test-driver-route-registration.js` - Comprehensive test suite

## Backward Compatibility

- Existing `route` field maintained for backward compatibility
- Legacy code continues to work with route field
- New code uses `routeId` and `routeName` for enhanced functionality
- Migration smooth - no breaking changes

## Future Enhancements

1. **Route Assignment Management**
   - Admin panel to assign/reassign drivers to routes
   - Route schedule management

2. **Multi-Route Support**
   - Allow drivers to be assigned to multiple routes
   - Route switching during shifts

3. **Route Analytics**
   - Track driver performance by route
   - Route popularity metrics
   - Coverage analysis

4. **Dynamic Route Updates**
   - Real-time route modifications
   - Temporary route changes
   - Detour notifications
