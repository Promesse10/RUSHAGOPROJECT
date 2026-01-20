import React from 'react';
// Use real react-native-maps for native platforms
import MapView, { Marker, Callout } from 'react-native-maps';
import { StyleSheet, View, Text, Image } from 'react-native';
import carIcon from '../../assets/car-marker.png'; // Import your car icon

const NativeMap = ({ initialRegion, markers = [], onSelectCar }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
      >
        {markers.map((car) => (
          <Marker
            key={car.id}
            coordinate={car.coordinate}
            title={car.title}
            onPress={() => onSelectCar(car)}
          >
            <View style={styles.markerContainer}>
              {/* Car icon instead of price bubble */}
              <Image source={carIcon} style={styles.markerIcon} />
            </View>
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{car.title}</Text>
                <Text style={styles.calloutPrice}>FRW{car.price}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
    color: '#4B4DFF',
    marginTop: 5,
  },
});

export default NativeMap;