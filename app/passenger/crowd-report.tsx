import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Users, CheckCircle } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

interface CrowdOption {
  level: 'low' | 'medium' | 'high';
  emoji: string;
  label: string;
  description: string;
  color: string;
}

const crowdOptions: CrowdOption[] = [
  {
    level: 'low',
    emoji: '🟢',
    label: 'Less Crowded',
    description: 'Plenty of seats available',
    color: Colors.crowd.low,
  },
  {
    level: 'medium',
    emoji: '🟡',
    label: 'Moderately Crowded',
    description: 'Some seats available',
    color: Colors.crowd.medium,
  },
  {
    level: 'high',
    emoji: '🔴',
    label: 'Highly Crowded',
    description: 'Standing room only',
    color: Colors.crowd.high,
  },
];

export default function CrowdReport() {
  const params = useLocalSearchParams();
  const busId = params.busId as string;
  
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleSubmit = async () => {
    if (!selectedLevel) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto close after 2 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          router.back();
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting crowd report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Report Crowd Level</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Help other passengers by reporting the current crowd level
            </Text>

            {/* Crowd Options */}
            <View style={styles.optionsContainer}>
              {crowdOptions.map((option) => (
                <TouchableOpacity
                  key={option.level}
                  style={[
                    styles.optionCard,
                    selectedLevel === option.level && styles.selectedOption,
                    { borderColor: selectedLevel === option.level ? option.color : Colors.border }
                  ]}
                  onPress={() => setSelectedLevel(option.level)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    {selectedLevel === option.level && (
                      <CheckCircle size={24} color={option.color} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <Button
              title={isSubmitting ? "Submitting..." : "Submit Report"}
              onPress={handleSubmit}
              disabled={!selectedLevel || isSubmitting}
              style={styles.submitButton}
            />

            {/* Info Text */}
            <Text style={styles.infoText}>
              Your report helps other passengers make informed decisions
            </Text>
          </View>

          {/* Success Overlay */}
          {showSuccess && (
            <Animated.View 
              style={[
                styles.successOverlay,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.successContent}>
                <CheckCircle size={64} color={Colors.success} />
                <Text style={styles.successTitle}>Thank you!</Text>
                <Text style={styles.successMessage}>
                  Your report helps other passengers
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
  },
  selectedOption: {
    backgroundColor: Colors.background.secondary,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  submitButton: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});