import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { User, Search, Filter, MoreVertical } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Colors } from '../../constants/colors';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'driver' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
  totalRides?: number;
  rating?: number;
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'passenger' | 'driver' | 'admin'>('all');

  const users: UserData[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'passenger',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      totalRides: 45,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'driver',
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '30 minutes ago',
      totalRides: 128,
      rating: 4.9,
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      role: 'passenger',
      status: 'inactive',
      joinDate: '2024-01-08',
      lastActive: '3 days ago',
      totalRides: 12,
      rating: 4.5,
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-01',
      lastActive: '1 hour ago',
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || user.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: UserData['status']) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'inactive':
        return Colors.warning;
      case 'suspended':
        return Colors.danger;
      default:
        return Colors.gray[400];
    }
  };

  const getRoleColor = (role: UserData['role']) => {
    switch (role) {
      case 'admin':
        return Colors.danger;
      case 'driver':
        return Colors.primary;
      case 'passenger':
        return Colors.secondary;
      default:
        return Colors.gray[400];
    }
  };

  const filters = [
    { key: 'all', label: 'All Users' },
    { key: 'passenger', label: 'Passengers' },
    { key: 'driver', label: 'Drivers' },
    { key: 'admin', label: 'Admins' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.gray[400]} />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.activeFilterChip
              ]}
              onPress={() => setActiveFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredUsers.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {filteredUsers.filter(u => u.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {filteredUsers.filter(u => u.role === 'driver').length}
            </Text>
            <Text style={styles.statLabel}>Drivers</Text>
          </View>
        </View>

        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userAvatar}>
                <User size={24} color={Colors.white} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreVertical size={20} color={Colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <View style={styles.userDetails}>
              <View style={styles.userBadges}>
                <View style={[styles.badge, { backgroundColor: getRoleColor(user.role) }]}>
                  <Text style={styles.badgeText}>{user.role}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(user.status) }]}>
                  <Text style={styles.badgeText}>{user.status}</Text>
                </View>
              </View>

              <View style={styles.userStats}>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Joined</Text>
                  <Text style={styles.userStatValue}>{user.joinDate}</Text>
                </View>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Last Active</Text>
                  <Text style={styles.userStatValue}>{user.lastActive}</Text>
                </View>
                {user.totalRides && (
                  <View style={styles.userStat}>
                    <Text style={styles.userStatLabel}>Rides</Text>
                    <Text style={styles.userStatValue}>{user.totalRides}</Text>
                  </View>
                )}
                {user.rating && (
                  <View style={styles.userStat}>
                    <Text style={styles.userStatLabel}>Rating</Text>
                    <Text style={styles.userStatValue}>★ {user.rating}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    marginLeft: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeFilterText: {
    color: Colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  userDetails: {
    gap: 12,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  userStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 2,
  },
});