import { Tabs } from 'expo-router';
import { Home, Search, MapPin, User } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

export default function PassengerLayout() {
  const { user } = useAuth();
  const isSimpleMode = user?.uiMode === 'SIMPLE';

  if (isSimpleMode) {
    // Simple Mode - 3 tabs
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray[400],
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopColor: Colors.border,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size + 4} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => <MapPin size={size + 4} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <User size={size + 4} color={color} />,
          }}
        />
        {/* Hide other screens from tab bar */}
        <Tabs.Screen
          name="search"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="routes-buses"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="route-details"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="bus-tracking"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="nearby-buses"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crowd-report"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="saved-places"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="notification-settings"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="off-route-guidance"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="book-ride"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  // Modern Mode - 4 tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hide other screens from tab bar */}
      <Tabs.Screen
        name="routes-buses"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="route-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="bus-tracking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="nearby-buses"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="crowd-report"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="saved-places"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notification-settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="off-route-guidance"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="book-ride"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}