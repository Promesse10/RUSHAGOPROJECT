import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

// This uses the Google Maps JavaScript API for web
const WebMap = ({ initialRegion, markers, style }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (mapRef.current && window.google) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { 
          lat: initialRegion.latitude, 
          lng: initialRegion.longitude 
        },
        zoom: 14,
      });

      // Add markers
      markers?.forEach(marker => {
        new window.google.maps.Marker({
          position: { 
            lat: marker.coordinate.latitude, 
            lng: marker.coordinate.longitude 
          },
          map: googleMapRef.current,
          title: marker.title,
        });
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <div ref={mapRef} style={styles.mapDiv} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapDiv: {
    width: '100%',
    height: '100%',
  },
});

export default WebMap;