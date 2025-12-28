import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const carouselSlides = [
  {
    slide: 1,
    title: "Track buses in real-time",
    icon: "🚌",
    description: "See exactly where your bus is and when it will arrive"
  },
  {
    slide: 2,
    title: "Find routes to your destination",
    icon: "🗺️",
    description: "Get the best routes and connections to reach anywhere"
  },
  {
    slide: 3,
    title: "Get arrival predictions offline",
    icon: "📱",
    description: "Access bus times even when you're not connected"
  }
];

const languages = ['English', 'Sinhala', 'Tamil'];

export default function AuthWelcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleGoogleSignIn = () => {
    router.push('/auth/role-selection');
  };

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Left Panel - Branding */}
      <View style={styles.leftPanel}>
        <View style={styles.brandingContainer}>
          <Text style={styles.appName}>TransLink.lk</Text>
          <Text style={styles.tagline}>Real-time public transport tracking</Text>
        </View>
        
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get started</Text>
        </TouchableOpacity>
      </View>

      {/* Right Panel - Login/Welcome */}
      <View style={styles.rightPanel}>
        <ScrollView contentContainerStyle={styles.rightContent}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gmail or Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPlaceholder}>Enter your email or phone</Text>
            </View>
          </View>

          <Button
            title="Continue"
            onPress={handleGoogleSignIn}
            style={styles.continueButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpLink}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing you agree to our Terms & Privacy
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  leftPanel: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    padding: 40,
  },
  brandingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  rightContent: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  welcomeHeader: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
  },
  inputPlaceholder: {
    fontSize: 16,
    color: Colors.gray[400],
  },
  continueButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginHorizontal: 16,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginBottom: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  signUpLink: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  termsText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});