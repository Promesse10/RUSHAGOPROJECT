import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CarCard from '../components/CarCard';

const MyCars = ({ navigation }) => {
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  
  // Mock data for cars
  const cars = [
    {
      id: '1',
      name: 'Audi Q7 50 Quattro',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png',
      model: '2023',
      status: 'active',
      gearType: 'Automatic',
      horsepower: '335 hp',
      price: '$120/day',
      category: 'Business',
    },
    {
      id: '2',
      name: 'BMW X5',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png',
      model: '2022',
      status: 'active',
      gearType: 'Automatic',
      horsepower: '300 hp',
      price: '$110/day',
      category: 'Family Trip',
    },
    {
      id: '3',
      name: 'Mercedes GLE',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png',
      model: '2023',
      status: 'pending',
      gearType: 'Automatic',
      horsepower: '320 hp',
      price: '$130/day',
      category: 'Business',
    },
    {
      id: '4',
      name: 'Tesla Model Y',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png',
      model: '2023',
      status: 'active',
      gearType: 'Automatic',
      horsepower: 'Electric',
      price: '$140/day',
      category: 'Business',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cars</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewType === 'grid' && styles.activeToggle]}
            onPress={() => setViewType('grid')}
          >
            <MaterialIcons name="grid-view" size={24} color={viewType === 'grid' ? '#007EFD' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewType === 'list' && styles.activeToggle]}
            onPress={() => setViewType('list')}
          >
            <MaterialIcons name="view-list" size={24} color={viewType === 'list' ? '#007EFD' : '#888'} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        numColumns={viewType === 'grid' ? 2 : 1}
        key={viewType} // Force re-render when view type changes
        renderItem={({ item }) => (
          <CarCard 
            car={item} 
            viewType={viewType}
            onPress={() => navigation.navigate('CarDetail', { car: item })}
            onEdit={() => navigation.navigate('AddNewCar', { car: item, isEditing: true })}
            onPromote={() => navigation.navigate('TopChoiceAds', { car: item })}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNewCar')}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#E0E0E0',
  },
  listContainer: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007EFD',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MyCars;
