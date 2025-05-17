import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const CarDetail = ({ route, navigation }) => {
  const { car } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddNewCar', { car, isEditing: true })}>
          <MaterialIcons name="edit" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: car.image || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png' }}
          style={styles.carImage}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.carName}>{car.name}</Text>
            <View style={[
              styles.statusBadge, 
              car.status === 'active' ? styles.activeBadge : styles.pendingBadge
            ]}>
              <Text style={styles.statusText}>
                {car.status === 'active' ? 'Active' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={20} color="#666666" />
              <Text style={styles.infoText}>{car.model}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="speed" size={20} color="#666666" />
              <Text style={styles.infoText}>{car.horsepower}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="settings" size={20} color="#666666" />
              <Text style={styles.infoText}>{car.gearType}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Rental Price</Text>
            <Text style={styles.price}>{car.price}</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Car Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{car.category}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fuel Type</Text>
              <Text style={styles.detailValue}>{car.fuelType || 'Gasoline'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability</Text>
              <View style={styles.availabilityIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.detailValue}>Available</Text>
              </View>
            </View>
          </View>

          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Details</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>John Smith</Text>
                <Text style={styles.ownerType}>Business Owner</Text>
                <Text style={styles.ownerLocation}>New York, NY</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  carImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    color: '#666666',
    fontSize: 14,
  },
  priceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007EFD',
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  ownerSection: {
    marginBottom: 20,
  },
  ownerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  ownerType: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  ownerLocation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#007EFD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CarDetail;
