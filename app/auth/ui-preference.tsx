import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

type UIMode = 'SIMPLE' | 'MODERN';

const uiModes = [
  {
    mode_id: 'SIMPLE' as UIMode,
    mode_name: 'Simple Mode',
    description: 'Large buttons, high contrast, step-by-step',
    features: [
      'Large, easy-to-tap buttons',
      'High contrast colors',
      'Step-by-step guidance',
      'Simplified navigation'
    ],
    preview_color: Colors.success,
  },
  {
    mode_id: 'MODERN' as UIMode,
    mode_name: 'Modern Mode',
    description: 'Compact design, smooth animations',
    features: [
      'Compact, efficient design',
      'Smooth animations',
      'Advanced features',
      'Quick access shortcuts'
    ],
    preview_color: Colors.primary,
  },
];

export default function UIPreferenceSelection() {
  const [selectedMode, setSelectedMode] = useState<UIMode>('MODERN');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateUser({ uiMode: selectedMode });
      router.replace('/passenger');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Interface</Text>
          <Text style={styles.subtitle}>
            Select the interface style that works best for you
          </Text>
          <Text style={styles.note}>
            You can change this anytime in Settings
          </Text>
        </View>

        <View style={styles.modeComparison}>
          {uiModes.map((mode) => {
            const isSelected = selectedMode === mode.mode_id;
            
            return (
              <TouchableOpacity
                key={mode.mode_id}
                style={[
                  styles.modeCard,
                  isSelected && styles.selectedModeCard
                ]}
                onPress={() => setSelectedMode(mode.mode_id)}
              >
                {/* Preview mockup */}
                <View style={[
                  styles.previewContainer,
                  { backgroundColor: mode.preview_color }
                ]}>
                  <View style={styles.previewHeader}>
                    <View style={styles.previewTitle} />
                    <View style={styles.previewIcon} />
                  </View>
                  
                  {mode.mode_id === 'SIMPLE' ? (
                    <View style={styles.simplePreview}>
                      <View style={styles.largeButton} />
                      <View style={styles.largeButton} />
                      <View style={styles.largeButton} />
                    </View>
                  ) : (
                    <View style={styles.modernPreview}>
                      <View style={styles.compactRow}>
                        <View style={styles.smallButton} />
                        <View style={styles.smallButton} />
                      </View>
                      <View style={styles.cardRow} />
                      <View style={styles.cardRow} />
                    </View>
                  )}
                </View>

                <View style={styles.modeInfo}>
                  <Text style={[
                    styles.modeName,
                    isSelected && styles.selectedModeName
                  ]}>
                    {mode.mode_name}
                  </Text>
                  
                  <Text style={[
                    styles.modeDescription,
                    isSelected && styles.selectedModeDescription
                  ]}>
                    {mode.description}
                  </Text>

                  <View style={styles.featuresList}>
                    {mode.features.map((feature, index) => (
                      <Text 
                        key={index}
                        style={[
                          styles.feature,
                          isSelected && styles.selectedFeature
                        ]}
                      >
                        • {feature}
                      </Text>
                    ))}
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>✓ Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          style={styles.continueButton}
        />
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modeComparison: {
    gap: 20,
    marginBottom: 40,
  },
  modeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedModeCard: {
    borderColor: Colors.primary,
  },
  previewContainer: {
    height: 120,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    opacity: 0.9,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewTitle: {
    width: 60,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
  },
  previewIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  simplePreview: {
    gap: 8,
  },
  largeButton: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  modernPreview: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 6,
  },
  cardRow: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  modeInfo: {
    alignItems: 'center',
  },
  modeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  selectedModeName: {
    color: Colors.primary,
  },
  modeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  selectedModeDescription: {
    color: Colors.text.primary,
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  feature: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  selectedFeature: {
    color: Colors.text.primary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});