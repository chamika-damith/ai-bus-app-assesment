import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  CreditCard, 
  MapPin, 
  Navigation, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle 
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { getAPIClient } from '../../lib/api';

interface PaymentDetails {
  busId: string;
  routeName: string;
  fromStop: string;
  toStop: string;
  distance: number;
  estimatedTime: number;
  fare: number;
}

const PaymentScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Parse payment details from params
  const paymentDetails: PaymentDetails = {
    busId: params.busId as string,
    routeName: params.routeName as string,
    fromStop: params.fromStop as string,
    toStop: params.toStop as string,
    distance: parseFloat(params.distance as string) || 0,
    estimatedTime: parseInt(params.estimatedTime as string) || 0,
    fare: parseFloat(params.fare as string) || 0,
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would call a payment API here
      // const apiClient = getAPIClient();
      // await apiClient.processPayment({...paymentDetails, method: paymentMethod});

      setPaymentSuccess(true);
      
      // Show success message and navigate back after delay
      setTimeout(() => {
        Alert.alert(
          'Payment Successful!',
          `Your ticket has been booked for ${paymentDetails.routeName}`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (method: 'card' | 'cash', label: string, icon: any) => (
    <TouchableOpacity
      style={[
        styles.paymentMethodCard,
        paymentMethod === method && styles.paymentMethodSelected,
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      {icon}
      <Text
        style={[
          styles.paymentMethodText,
          paymentMethod === method && styles.paymentMethodTextSelected,
        ]}
      >
        {label}
      </Text>
      {paymentMethod === method && (
        <View style={styles.selectedIndicator}>
          <CheckCircle size={20} color={Colors.success} />
        </View>
      )}
    </TouchableOpacity>
  );

  if (paymentSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={Colors.success} />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            Your ticket has been booked
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <XCircle size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Journey Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bus Route</Text>
              <Text style={styles.detailValue}>{paymentDetails.routeName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bus ID</Text>
              <Text style={styles.detailValue}>{paymentDetails.busId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.routeDetails}>
              <View style={styles.stopContainer}>
                <MapPin size={20} color={Colors.success} />
                <View style={styles.stopInfo}>
                  <Text style={styles.stopLabel}>From</Text>
                  <Text style={styles.stopName}>{paymentDetails.fromStop}</Text>
                </View>
              </View>
              <View style={styles.routeLine}>
                <View style={styles.routeDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
              <View style={styles.stopContainer}>
                <MapPin size={20} color={Colors.danger} />
                <View style={styles.stopInfo}>
                  <Text style={styles.stopLabel}>To</Text>
                  <Text style={styles.stopName}>{paymentDetails.toStop}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Navigation size={16} color={Colors.primary} />
                <Text style={styles.metricText}>
                  {(paymentDetails.distance * 1000).toFixed(0)}m
                </Text>
              </View>
              <View style={styles.metric}>
                <Clock size={16} color={Colors.primary} />
                <Text style={styles.metricText}>
                  ~{paymentDetails.estimatedTime} min
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          <View style={styles.card}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Base Fare</Text>
              <Text style={styles.fareValue}>LKR {(paymentDetails.fare * 0.6).toFixed(2)}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Distance Charge</Text>
              <Text style={styles.fareValue}>LKR {(paymentDetails.fare * 0.4).toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.fareRow}>
              <Text style={styles.totalLabel}>Total Fare</Text>
              <Text style={styles.totalValue}>LKR {paymentDetails.fare.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {renderPaymentMethod(
              'card',
              'Card Payment',
              <CreditCard size={24} color={paymentMethod === 'card' ? Colors.primary : Colors.gray[500]} />
            )}
            {renderPaymentMethod(
              'cash',
              'Pay on Bus',
              <DollarSign size={24} color={paymentMethod === 'cash' ? Colors.primary : Colors.gray[500]} />
            )}
          </View>
        </View>

        {/* Payment Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.payButtonText}>
                  {paymentMethod === 'card' ? 'Pay Now' : 'Confirm Booking'}
                </Text>
                <Text style={styles.payButtonAmount}>LKR {paymentDetails.fare.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding, you agree to the terms and conditions of service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 12,
  },
  routeDetails: {
    paddingVertical: 8,
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stopLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  routeLine: {
    paddingLeft: 10,
    paddingVertical: 8,
  },
  routeDots: {
    flexDirection: 'column',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[400],
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  fareValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E3F2FD',
  },
  paymentMethodText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  paymentMethodTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  payButtonAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  termsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  termsText: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});

export default PaymentScreen;
