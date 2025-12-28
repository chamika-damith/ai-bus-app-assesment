# Google Maps Setup for TransLink App

## Overview
The TransLink app now uses Google Maps for real-time bus tracking and location services.

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (optional, for address search)
   - Geocoding API (optional, for reverse geocoding)

4. Create credentials (API Key)
5. Restrict the API key to your app's bundle identifier

### 2. Configure API Key

Replace `YOUR_GOOGLE_MAPS_API_KEY` in `app.json` with your actual API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  }
}
```

### 3. Environment Variables (Recommended)
For security, use environment variables:

1. Create `.env` file in project root:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Update `app.json` to use environment variable:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${GOOGLE_MAPS_API_KEY}"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY}"
      }
    }
  }
}
```

### 4. Test the Integration
1. Run `expo start`
2. Test on device or simulator
3. Verify map loads correctly
4. Test location permissions
5. Test pin dropping and bus markers

## Features Implemented

### Map Features
- ✅ Real Google Maps integration
- ✅ User location tracking
- ✅ Pin mode for destination selection
- ✅ Browse mode for viewing nearby buses
- ✅ Map type toggle (Standard/Satellite)
- ✅ Zoom controls
- ✅ My location button

### Bus Tracking
- ✅ Bus markers on map
- ✅ Custom bus marker design
- ✅ Tap to track individual buses
- ✅ Real-time location updates (mock data)

### Location Services
- ✅ Location permission handling
- ✅ Current location detection
- ✅ Location-based map centering
- ✅ Coordinate display for pinned locations

## Troubleshooting

### Common Issues
1. **Map not loading**: Check API key configuration
2. **Location not working**: Verify permissions in app.json
3. **Markers not showing**: Check coordinate format (latitude/longitude)
4. **Build errors**: Ensure react-native-maps is properly installed

### Development Tips
- Use Expo Go for testing (limited Google Maps support)
- For full testing, create development build
- Test on physical device for location services
- Check console for API key errors

## Next Steps
1. Add real bus data from backend API
2. Implement route polylines
3. Add traffic layer
4. Integrate with navigation apps
5. Add offline map caching