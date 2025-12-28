import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Mic, Clock, MapPin, Star } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Colors } from '../../constants/colors';

const categories = [
  { id: 'schools', name: 'Schools', icon: '🏫' },
  { id: 'hospitals', name: 'Hospitals', icon: '🏥' },
  { id: 'shopping', name: 'Shopping', icon: '🛒' },
  { id: 'transport', name: 'Transport Hubs', icon: '🚉' },
];

const recentSearches = [
  'Colombo Fort Railway Station',
  'University of Colombo',
  'Bandaranaike International Airport',
  'Galle Face Green',
  'National Hospital of Sri Lanka',
];

const popularDestinations = [
  { name: 'Colombo Fort', category: 'Transport Hub' },
  { name: 'Pettah Market', category: 'Shopping' },
  { name: 'Mount Lavinia Beach', category: 'Recreation' },
  { name: 'Colombo University', category: 'Education' },
];

export default function DestinationSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/passenger/routes-buses?destination=${encodeURIComponent(query)}`);
    }
  };

  const handleVoiceSearch = () => {
    // Mock voice search - replace with actual implementation
    console.log('Voice search activated');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Where to?</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.gray[400]} />
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              containerStyle={styles.searchInput}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.voiceButton}
              onPress={handleVoiceSearch}
            >
              <Mic size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() => handleSearch(search)}
              >
                <Clock size={16} color={Colors.gray[400]} />
                <Text style={styles.listItemText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Popular Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          {popularDestinations.map((destination, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() => handleSearch(destination.name)}
            >
              <Star size={16} color={Colors.warning} />
              <View style={styles.destinationInfo}>
                <Text style={styles.listItemText}>{destination.name}</Text>
                <Text style={styles.categoryText}>{destination.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    marginLeft: 8,
  },
  voiceButton: {
    padding: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '22%',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategory: {
    borderColor: Colors.primary,
    backgroundColor: Colors.light,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  destinationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});