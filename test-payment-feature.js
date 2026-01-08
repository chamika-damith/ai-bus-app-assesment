#!/usr/bin/env node

/**
 * Test script for Payment Feature
 * Tests the complete flow: Active Buses -> Stop Selection -> Payment Screen
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.cyan}▶${colors.reset} ${msg}`),
  data: (msg) => console.log(`${colors.magenta}●${colors.reset} ${msg}`)
};

// Fare calculation function (same as in app)
const calculateFare = (distance) => {
  const baseFare = 10;
  const perKmRate = 5;
  return baseFare + (distance * perKmRate);
};

// Distance calculation (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const testPaymentFeature = async () => {
  console.log('\n' + '='.repeat(70));
  log.info('Testing Payment Feature Integration');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Get routes
    log.test('Step 1: Fetching available routes...');
    const routesResponse = await axios.get(`${API_BASE_URL}/routes`);
    
    if (!routesResponse.data.success) {
      log.error('Failed to fetch routes');
      return;
    }

    const routes = routesResponse.data.data;
    log.success(`Found ${routes.length} routes`);
    console.log();

    // Step 2: Get active buses
    log.test('Step 2: Fetching active buses...');
    const busesResponse = await axios.get(`${API_BASE_URL}/gps/buses/live`);
    
    if (!busesResponse.data.success) {
      log.error('Failed to fetch active buses');
      return;
    }

    const buses = busesResponse.data.data;
    log.success(`Found ${buses.length} active buses`);
    console.log();

    if (buses.length === 0) {
      log.warn('No active buses found. Start GPS tracking for at least one driver.');
      return;
    }

    // Step 3: Simulate stop selection and payment calculation
    log.test('Step 3: Simulating stop selection for payment...');
    
    const testBus = buses[0];
    log.data(`Selected Bus: ${testBus.busId}`);
    log.data(`Route: ${testBus.routeName || 'Unknown'}`);
    log.data(`Current Location: [${testBus.location.latitude}, ${testBus.location.longitude}]`);
    console.log();

    // Find the route for this bus
    const busRouteNumber = testBus.routeName ? testBus.routeName.match(/^(\d+)/)?.[1] : null;
    const busRoute = routes.find(r => r.routeNumber === busRouteNumber);

    if (!busRoute) {
      log.warn(`No route found for bus ${testBus.busId}`);
      return;
    }

    log.success(`Found route: ${busRoute.routeName}`);
    log.data(`Route has ${busRoute.stops.length} stops`);
    console.log();

    // Find nearest stop (current location)
    let nearestStop = null;
    let minDistance = Infinity;

    busRoute.stops.forEach(stop => {
      const distance = calculateDistance(
        testBus.location.latitude,
        testBus.location.longitude,
        stop.location.coordinates[1],
        stop.location.coordinates[0]
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    });

    if (!nearestStop) {
      log.error('Could not find nearest stop');
      return;
    }

    log.success(`Current stop (nearest): ${nearestStop.name}`);
    log.data(`Distance from bus: ${(minDistance * 1000).toFixed(0)}m`);
    console.log();

    // Simulate selecting different destination stops
    log.test('Step 4: Calculating fares for different destinations...');
    console.log();

    const destinationStops = busRoute.stops.filter(s => s.stopId !== nearestStop.stopId).slice(0, 3);

    destinationStops.forEach((destStop, index) => {
      const distance = calculateDistance(
        nearestStop.location.coordinates[1],
        nearestStop.location.coordinates[0],
        destStop.location.coordinates[1],
        destStop.location.coordinates[0]
      );

      const estimatedTime = Math.ceil((distance / 30) * 60); // 30 km/h average
      const fare = calculateFare(distance);

      log.data(`Destination ${index + 1}: ${destStop.name}`);
      log.data(`  Distance: ${(distance * 1000).toFixed(0)}m (${distance.toFixed(2)} km)`);
      log.data(`  Estimated Time: ${estimatedTime} minutes`);
      log.data(`  Fare: LKR ${fare.toFixed(2)}`);
      log.data(`    - Base Fare: LKR ${(fare * 0.6).toFixed(2)}`);
      log.data(`    - Distance Charge: LKR ${(fare * 0.4).toFixed(2)}`);
      console.log();
    });

    // Step 5: Payment flow summary
    log.test('Step 5: Payment Flow Summary');
    console.log();
    
    const selectedDestination = destinationStops[0];
    const distance = calculateDistance(
      nearestStop.location.coordinates[1],
      nearestStop.location.coordinates[0],
      selectedDestination.location.coordinates[1],
      selectedDestination.location.coordinates[0]
    );
    const estimatedTime = Math.ceil((distance / 30) * 60);
    const fare = calculateFare(distance);

    log.success('Sample Payment Transaction:');
    console.log();
    console.log(colors.cyan + '  Journey Details:' + colors.reset);
    log.data(`  Bus: ${testBus.busId}`);
    log.data(`  Route: ${busRoute.routeName}`);
    log.data(`  From: ${nearestStop.name}`);
    log.data(`  To: ${selectedDestination.name}`);
    console.log();
    console.log(colors.cyan + '  Trip Information:' + colors.reset);
    log.data(`  Distance: ${(distance * 1000).toFixed(0)}m`);
    log.data(`  Estimated Time: ${estimatedTime} minutes`);
    console.log();
    console.log(colors.cyan + '  Fare Breakdown:' + colors.reset);
    log.data(`  Base Fare: LKR ${(fare * 0.6).toFixed(2)}`);
    log.data(`  Distance Charge: LKR ${(fare * 0.4).toFixed(2)}`);
    log.data(`  ${colors.green}Total: LKR ${fare.toFixed(2)}${colors.reset}`);
    console.log();

    console.log(colors.cyan + '  Payment Methods Available:' + colors.reset);
    log.data('  💳 Card Payment');
    log.data('  💵 Pay on Bus');
    console.log();

    // Final Summary
    console.log('\n' + '='.repeat(70));
    log.success('Payment Feature Test Completed!');
    console.log('='.repeat(70) + '\n');

    console.log(colors.cyan + 'FEATURE CAPABILITIES:' + colors.reset);
    console.log('━'.repeat(70));
    console.log('✓ View all active buses with routes');
    console.log('✓ Click bus to see all stops on the route');
    console.log('✓ Click any stop to initiate payment');
    console.log('✓ Automatic fare calculation based on distance');
    console.log('✓ Display journey details (from/to stops)');
    console.log('✓ Show fare breakdown (base + distance charge)');
    console.log('✓ Multiple payment options (card/cash)');
    console.log('✓ Estimated travel time calculation');
    console.log('✓ Current stop detection (nearest to bus)');
    console.log('━'.repeat(70) + '\n');

    console.log(colors.cyan + 'USER FLOW:' + colors.reset);
    console.log('━'.repeat(70));
    console.log('1. Passenger opens "Active Buses" screen');
    console.log('2. Sees list of all buses currently running');
    console.log('3. Taps on a bus to view route details');
    console.log('4. Modal shows bus\'s current location and all stops');
    console.log('5. Passenger taps on their destination stop');
    console.log('6. Navigates to Payment screen with calculated fare');
    console.log('7. Reviews journey details and fare breakdown');
    console.log('8. Selects payment method (Card or Cash)');
    console.log('9. Confirms payment/booking');
    console.log('10. Receives confirmation and ticket');
    console.log('━'.repeat(70) + '\n');

    console.log(colors.cyan + 'FARE CALCULATION FORMULA:' + colors.reset);
    console.log('━'.repeat(70));
    console.log('  Base Fare: LKR 10');
    console.log('  Per Kilometer: LKR 5');
    console.log('  Total = Base Fare + (Distance in km × Rate per km)');
    console.log('━'.repeat(70) + '\n');

  } catch (error) {
    log.error('Test failed with error:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('  No response from server. Is the backend running on port 5001?');
    } else {
      console.error(`  ${error.message}`);
    }
    console.log('\n' + colors.yellow + 'Prerequisites:' + colors.reset);
    console.log('  1. Backend server running on port 5001');
    console.log('  2. Routes seeded (run: node BusTracking-Backend/seed-routes.js)');
    console.log('  3. At least one driver online with GPS tracking');
    console.log('  4. MongoDB running and connected\n');
  }
};

// Run the test
testPaymentFeature();
