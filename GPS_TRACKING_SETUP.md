# GPS Tracking System Setup Guide

## Overview
This system enables real-time bus tracking using driver mobile phones as GPS devices. Each bus driver uses their phone to broadcast location data to passengers.

## System Architecture

```
[Driver Phone] → [GPS API Server] → [Passenger Apps]
     ↓                ↓                    ↓
  GPS Tracker    Location Storage    Live Bus Map
```

## 🚀 Quick Start

### 1. Server Setup

**Deploy the GPS API Server:**
```bash
# Install dependencies
npm install hono ws

# Start the server
node backend/lib/gps-api.js
```

**Server will run on:** `http://localhost:3000`

### 2. Driver Registration Process

**Step 1: Admin registers drivers**
```bash
curl -X POST http://your-server.com/api/driver/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kamal Perera",
    "phone": "+94771234567",
    "licenseNumber": "DL001234",
    "busId": "bus_138_01",
    "routeId": "route_138",
    "deviceId": "device_android_001"
  }'
```

**Step 2: Driver downloads TransLink app**
- Install TransLink app on driver's phone
- Driver logs in with registered phone number
- App automatically detects device ID

**Step 3: Start GPS tracking**
- Driver opens GPS Tracker screen
- Toggles tracking ON
- Location broadcasts every 5 seconds

### 3. Passenger Integration

**Passengers see live buses on map:**
- Open TransLink passenger app
- Go to Map screen
- Switch to "Browse Mode"
- See real-time bus locations with icons

## 📱 Driver Phone Requirements

### Minimum Requirements
- **Android 8.0+** or **iOS 12.0+**
- **GPS capability** (all modern phones)
- **Internet connection** (3G/4G/WiFi)
- **Battery optimization disabled** for TransLink app

### Recommended Setup
- **Power bank** or car charger
- **Phone mount** in bus
- **Unlimited data plan**
- **Background app refresh enabled**

## 🔧 Technical Implementation

### Driver Authentication
```typescript
// Unique identification method
const deviceId = `device_${Platform.OS}_${DeviceInfo.getUniqueId()}`;
const authentication = {
  phone: "+94771234567",
  deviceId: deviceId
};
```

### GPS Data Collection
```typescript
// Location tracking configuration
const locationConfig = {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000,        // 5 seconds
  distanceInterval: 10,      // 10 meters
  enableHighAccuracy: true
};
```

### Data Transmission
```typescript
// Location payload sent to server
const locationData = {
  driverId: "driver_001",
  busId: "bus_138_01",
  routeId: "route_138",
  latitude: 6.9271,
  longitude: 79.8612,
  heading: 45,
  speed: 35,
  accuracy: 5,
  timestamp: Date.now(),
  status: "active"
};
```

## 🗄️ Database Schema

### Drivers Table
```sql
CREATE TABLE drivers (
  driver_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  bus_id VARCHAR(50) NOT NULL,
  route_id VARCHAR(50) NOT NULL,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP
);
```

### Locations Table
```sql
CREATE TABLE bus_locations (
  id SERIAL PRIMARY KEY,
  driver_id VARCHAR(50) REFERENCES drivers(driver_id),
  bus_id VARCHAR(50) NOT NULL,
  route_id VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  accuracy DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'active',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bus_timestamp (bus_id, timestamp),
  INDEX idx_route_timestamp (route_id, timestamp)
);
```

## 🔐 Security & Privacy

### Driver Privacy Protection
- **No personal data** stored beyond registration
- **Location data** automatically deleted after 24 hours
- **Device ID** is anonymized hash
- **Phone numbers** encrypted in database

### API Security
```typescript
// Rate limiting
app.use('/api/driver/location', rateLimit({
  windowMs: 1000,     // 1 second
  max: 2              // Max 2 requests per second
}));

// Authentication middleware
app.use('/api/driver/*', authenticateDriver);
```

## 📊 Monitoring & Analytics

### Real-time Dashboard
- **Active drivers:** Currently broadcasting
- **Bus coverage:** Routes with active buses
- **Data quality:** GPS accuracy metrics
- **System health:** API response times

### Key Metrics
```typescript
const metrics = {
  activeDrivers: 15,
  totalBuses: 25,
  averageAccuracy: 8.5,  // meters
  updateFrequency: 5.2,  // seconds
  dataRetention: 24      // hours
};
```

## 🚨 Troubleshooting

### Common Issues

**1. Driver can't authenticate**
- Check phone number format (+94XXXXXXXXX)
- Verify device ID generation
- Ensure driver is registered in system

**2. GPS not updating**
- Check location permissions
- Verify internet connection
- Disable battery optimization
- Restart GPS tracking

**3. Passengers don't see buses**
- Check API server status
- Verify bus data in database
- Test API endpoints manually

**4. Poor GPS accuracy**
- Move to open area (away from buildings)
- Check phone GPS settings
- Ensure high accuracy mode enabled

### Debug Commands
```bash
# Check server health
curl http://your-server.com/api/health

# Get active buses
curl http://your-server.com/api/buses/live

# Get specific driver location
curl http://your-server.com/api/driver/location/driver_001

# View all registered drivers (admin)
curl http://your-server.com/api/admin/drivers
```

## 🔄 Production Deployment

### Server Requirements
- **CPU:** 2+ cores
- **RAM:** 4GB minimum
- **Storage:** 50GB SSD
- **Bandwidth:** 100Mbps
- **Database:** PostgreSQL or MySQL

### Scaling Considerations
- **Load balancer** for multiple API servers
- **Redis cache** for real-time data
- **WebSocket** for instant updates
- **CDN** for static assets

### Backup Strategy
- **Database backups** every 6 hours
- **Location history** archived monthly
- **Driver data** encrypted backups
- **API logs** retained for 30 days

## 📈 Future Enhancements

### Phase 2 Features
- **Route optimization** based on traffic
- **Passenger count** estimation
- **Fuel efficiency** tracking
- **Driver performance** metrics

### Advanced Features
- **Offline mode** with data sync
- **Geofencing** for bus stops
- **Predictive arrival** times
- **Integration** with traffic APIs

## 💡 Cost Estimation

### Monthly Costs (50 buses)
- **Server hosting:** $100-200
- **Database:** $50-100
- **Data transfer:** $20-50
- **SMS notifications:** $10-30
- **Total:** ~$200-400/month

### Cost per bus: ~$4-8/month

## 📞 Support

### For Drivers
- **Phone:** +94 11 XXX XXXX
- **WhatsApp:** +94 77 XXX XXXX
- **Email:** drivers@translink.lk

### For Passengers
- **App support:** support@translink.lk
- **Website:** www.translink.lk/help

---

## ✅ Implementation Checklist

- [ ] Deploy GPS API server
- [ ] Set up database tables
- [ ] Register initial drivers
- [ ] Test driver GPS tracking
- [ ] Verify passenger map updates
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Train drivers on app usage
- [ ] Launch pilot program
- [ ] Monitor and optimize

**Ready for production deployment!** 🚀