import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  Animated,
  Platform,
  Linking
} from 'react-native';
import { ChevronLeft, Layers, MapPin, Filter } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location'; // Assuming you're using Expo
import carIcon from '../../assets/car-marker.png'; // Ensure this path is correct
import CarDetailsModal from '../../components/Map/CarDetaiilsModal'; // Ensure this import is correct

const MapViewScreen = () => {
  const navigation = useNavigation();
  const [mapType, setMapType] = useState('standard');
  const [allCars, setAllCars] = useState([]);
  const [displayedCars, setDisplayedCars] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showOnlyNearby, setShowOnlyNearby] = useState(false);
  const mapRef = useRef(null);
  
  const scanAnimation = useRef(new Animated.Value(0)).current;
  
  // Rwanda major cities/locations with coordinates
  const rwandaLocations = [
    { name: "Kigali", latitude: -1.9441, longitude: 30.0619 },
    { name: "Butare", latitude: -2.5977, longitude: 29.7370 },
    { name: "Gisenyi", latitude: -1.7021, longitude: 29.2570 },
    { name: "Ruhengeri", latitude: -1.4996, longitude: 29.6342 },
    { name: "Cyangugu", latitude: -2.4846, longitude: 28.9086 },
    { name: "Kibungo", latitude: -2.1597, longitude: 30.5427 },
    { name: "Byumba", latitude: -1.5763, longitude: 30.0675 },
    { name: "Kibuye", latitude: -2.0600, longitude: 29.3480 },
    { name: "Nyanza", latitude: -2.3515, longitude: 29.7509 },
    { name: "Gitarama", latitude: -2.0744, longitude: 29.7567 },
  ];
  
  useEffect(() => {
    (async () => {
      try {
        // Load all cars across Rwanda first
        loadAllCarsAcrossRwanda();
        
        // Then request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            "Permission Denied",
            "Allow location access to see cars near you",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Settings", onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            ]
          );
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.5, // Zoomed out to see more of Rwanda
            longitudeDelta: 0.5,
          }, 1000);
        }
        
      } catch (error) {
        console.error("Error getting location:", error);
        setUserLocation({
          latitude: -1.9441, // Default to Kigali
          longitude: 30.0619,
        });
      }
    })();
  }, []);
  
  // Load cars across different locations in Rwanda
  const loadAllCarsAcrossRwanda = () => {
    // Car models and prices
    const carModels = [
      { model: 'Toyota Corolla', price: '25,000' },
      { model: 'Honda Civic', price: '28,000' },
      { model: 'Ford Focus', price: '22,000' },
      { model: 'Nissan Altima', price: '30,000' },
      { model: 'Hyundai Elantra', price: '26,000' },
      { model: 'Toyota RAV4', price: '35,000' },
      { model: 'Honda CR-V', price: '38,000' },
      { model: 'Mazda CX-5', price: '32,000' },
      { model: 'Kia Sportage', price: '29,000' },
      { model: 'Volkswagen Golf', price: '27,000' },
    ];
    
    // Generate cars across Rwanda
    let cars = [];
    let id = 1;
    
    // Add some cars in each major location
    rwandaLocations.forEach(location => {
      // Add 1-3 cars in each location
      const numCars = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numCars; i++) {
        const randomCarIndex = Math.floor(Math.random() * carModels.length);
        const car = carModels[randomCarIndex];
        
        // Add slight randomness to the location
        const latOffset = (Math.random() - 0.5) * 0.02;
        const lngOffset = (Math.random() - 0.5) * 0.02;
        
        cars.push({
          id: id.toString(),
          title: car.model,
          price: car.price,
          location: location.name,
          coordinate: {
            latitude: location.latitude + latOffset,
            longitude: location.longitude + lngOffset,
          },
          distance: 0, // Will be calculated if user location is available
        });
        
        id++;
      }
    });
    
    setAllCars(cars);
    setDisplayedCars(cars);
  };
  
  // Update distances when user location changes
  useEffect(() => {
    if (userLocation && allCars.length > 0) {
      const carsWithDistance = allCars.map(car => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          car.coordinate.latitude,
          car.coordinate.longitude
        );
        return { ...car, distance };
      });
      
      setAllCars(carsWithDistance);
      setDisplayedCars(carsWithDistance);
    }
  }, [userLocation]);
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    return distance;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    setModalVisible(true);
  };
  
  const startScan = () => {
    if (!userLocation) {
      Alert.alert(
        "Location Required",
        "Please enable location services to scan for nearby cars",
        [{ text: "OK" }]
      );
      return;
    }
    
    setIsScanning(true);
    scanAnimation.setValue(0);
    
    Animated.timing(scanAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      // When scan completes, filter cars by distance
      if (userLocation) {
        const nearbyCars = allCars
          .filter(car => car.distance <= 50) // Cars within 50km
          .sort((a, b) => a.distance - b.distance);
        
        setDisplayedCars(nearbyCars);
        setShowOnlyNearby(true);
        
        // Zoom map to show nearby area
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }, 1000);
        }
      }
      
      setIsScanning(false);
    });
  };
  
  const showAllCars = () => {
    setDisplayedCars(allCars);
    setShowOnlyNearby(false);
    
    // Zoom out to show all of Rwanda
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: -1.9441, // Center of Rwanda (roughly)
        longitude: 30.0619,
        latitudeDelta: 1.5,
        longitudeDelta: 1.5,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft width={24} height={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Map View</Text>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: -1.9441, // Center of Rwanda (roughly)
            longitude: 30.0619,
            latitudeDelta: 1.5, // Zoomed out to see more of Rwanda
            longitudeDelta: 1.5,
          }}
          showsUserLocation={true}
          followsUserLocation={false}
        >
          {userLocation && isScanning && (
            <Circle
              center={userLocation}
              radius={50000} // 50km radius
              strokeWidth={2}
              strokeColor="rgba(75, 77, 255, 0.5)"
              fillColor="rgba(75, 77, 255, 0.1)"
            />
          )}
          
          {displayedCars.map((car) => (
            <Marker
              key={car.id}
              coordinate={car.coordinate}
              title={car.title}
              onPress={() => handleSelectCar(car)}
            >
              <View style={styles.markerContainer}>
                <Image source={carIcon} style={styles.markerIcon} />
              </View>
              <Callout onPress={() => handleSelectCar(car)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{car.title}</Text>
                  <Text style={styles.calloutPrice}>FRW{car.price}</Text>
                  <Text style={styles.calloutLocation}>{car.location}</Text>
                  {userLocation && (
                    <Text style={styles.calloutDistance}>
                      {car.distance.toFixed(1)} km away
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        
        {/* Map type toggle button */}
        <TouchableOpacity 
          style={styles.mapTypeButton} 
          onPress={toggleMapType}
        >
          <Layers width={24} height={24} color="#000" />
          <Text style={styles.mapTypeText}>
            {mapType === 'standard' ? 'Satellite' : 'Standard'}
          </Text>
        </TouchableOpacity>
        
        {/* Filter toggle button */}
        {showOnlyNearby ? (
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={showAllCars}
          >
            <Filter width={20} height={20} color="#000" />
            <Text style={styles.filterText}>Show All</Text>
          </TouchableOpacity>
        ) : null}
        
        {/* Car count indicator */}
        <View style={styles.carCountContainer}>
          <Text style={styles.carCountText}>
            {displayedCars.length} cars available
            {showOnlyNearby ? ' nearby' : ' in Rwanda'}
          </Text>
        </View>
        
        {/* Radar scan button */}
        <TouchableOpacity 
          style={styles.radarButton}
          onPress={startScan}
          disabled={isScanning}
        >
          <View style={styles.radarButtonInner}>
            {isScanning ? (
              <Animated.View
                style={[
                  styles.radarAnimation,
                  {
                    opacity: scanAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 0.2, 0]
                    }),
                    transform: [
                      {
                        scale: scanAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 4]
                        })
                      }
                    ]
                  }
                ]}
              />
            ) : null}
            <MapPin width={24} height={24} color="#fff" />
          </View>
          <Text style={styles.radarText}>
            {isScanning ? 'Scanning...' : 'Find Nearby'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {selectedCar && (
        <CarDetailsModal
          visible={modalVisible}
          car={selectedCar}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  calloutContainer: {
    width: 150,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  calloutPrice: {
    color: '#007EFD',
    marginTop: 5,
  },
  calloutLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  mapTypeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  mapTypeText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  filterButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  carCountContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  carCountText: {
    fontWeight: 'bold',
  },
  radarButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
  },
  radarButtonInner: {
    backgroundColor: '#007EFD',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  radarAnimation: {
    position: 'absolute',
    backgroundColor: '#007EFD',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  radarText: {
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MapViewScreen;