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
import * as Location from 'expo-location';
import carIcon from '../../assets/car-marker.png';
import CarDetailsModal from '../../components/Map/CarDetaiilsModal';

// ✅ Load react-native-maps ONLY on native platforms
let MapView, Marker, Callout, Circle;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
  Circle = Maps.Circle;
}

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
        loadAllCarsAcrossRwanda();
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

        if (Platform.OS !== 'web' && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }, 1000);
        }

      } catch (error) {
        console.error("Error getting location:", error);
        setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
      }
    })();
  }, []);

  const loadAllCarsAcrossRwanda = () => {
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

    let cars = [];
    let id = 1;

    rwandaLocations.forEach(location => {
      const numCars = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numCars; i++) {
        const randomCar = carModels[Math.floor(Math.random() * carModels.length)];
        const latOffset = (Math.random() - 0.5) * 0.02;
        const lngOffset = (Math.random() - 0.5) * 0.02;

        cars.push({
          id: id.toString(),
          title: randomCar.model,
          price: randomCar.price,
          location: location.name,
          coordinate: {
            latitude: location.latitude + latOffset,
            longitude: location.longitude + lngOffset,
          },
          distance: 0,
        });
        id++;
      }
    });

    setAllCars(cars);
    setDisplayedCars(cars);
  };

  useEffect(() => {
    if (userLocation && allCars.length > 0) {
      const carsWithDistance = allCars.map(car => ({
        ...car,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          car.coordinate.latitude,
          car.coordinate.longitude
        ),
      }));
      setAllCars(carsWithDistance);
      setDisplayedCars(carsWithDistance);
    }
  }, [userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const deg2rad = deg => deg * (Math.PI / 180);

  const toggleMapType = () => setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  const handleSelectCar = car => { setSelectedCar(car); setModalVisible(true); };

  const startScan = () => {
    if (!userLocation) {
      Alert.alert("Location Required", "Please enable location services to scan for nearby cars");
      return;
    }

    setIsScanning(true);
    scanAnimation.setValue(0);

    Animated.timing(scanAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      const nearbyCars = allCars.filter(car => car.distance <= 50).sort((a, b) => a.distance - b.distance);
      setDisplayedCars(nearbyCars);
      setShowOnlyNearby(true);

      if (Platform.OS !== 'web' && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }, 1000);
      }

      setIsScanning(false);
    });
  };

  const showAllCars = () => {
    setDisplayedCars(allCars);
    setShowOnlyNearby(false);

    if (Platform.OS !== 'web' && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: -1.9441,
        longitude: 30.0619,
        latitudeDelta: 1.5,
        longitudeDelta: 1.5,
      }, 1000);
    }
  };

  // ✅ Web fallback view
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.headerTitle}>Map View (Web)</Text>
        <Text style={styles.webInfo}>
          Map preview is not available on web. Use the mobile app to see live maps.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Your existing native map code */}
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
            latitude: -1.9441,
            longitude: 30.0619,
            latitudeDelta: 1.5,
            longitudeDelta: 1.5,
          }}
          showsUserLocation={true}
        >
          {userLocation && isScanning && (
            <Circle
              center={userLocation}
              radius={50000}
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
              <Image source={carIcon} style={styles.markerIcon} />
              <Callout onPress={() => handleSelectCar(car)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{car.title}</Text>
                  <Text style={styles.calloutPrice}>FRW {car.price}</Text>
                  <Text style={styles.calloutLocation}>{car.location}</Text>
                  {userLocation && (
                    <Text style={styles.calloutDistance}>{car.distance.toFixed(1)} km away</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
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
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  markerIcon: { width: 32, height: 32, resizeMode: 'contain' },
  calloutContainer: { width: 150, padding: 10 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutPrice: { color: '#007EFD', marginTop: 5 },
  calloutLocation: { fontSize: 12, color: '#666', marginTop: 3 },
  calloutDistance: { fontSize: 12, color: '#666', marginTop: 3 },
  webContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webInfo: { textAlign: 'center', marginTop: 10, color: '#555' },
});

export default MapViewScreen;
