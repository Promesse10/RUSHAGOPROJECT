// Web-specific implementation - doesn't use react-native-maps
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const WebMap = ({ markers = [], onSelectCar }) => {
  // Simple map visualization for web
  return (
    <View style={styles.container}>
      <View style={styles.mapBackground}>
        <Text style={styles.mapTitle}>Available Cars</Text>
        
        {/* Simple grid to represent map */}
        <View style={styles.mapGrid}>
          {markers.map((car) => (
            <TouchableOpacity 
              key={car.id}
              style={[
                styles.carMarker,
                {
                  // Position markers based on coordinates
                  left: `${((car.coordinate.longitude + 180) / 360) * 100}%`,
                  top: `${((90 - car.coordinate.latitude) / 180) * 100}%`,
                }
              ]}
              onPress={() => onSelectCar(car)}
            >
              <View style={styles.markerDot}>
                <Text style={styles.markerPrice}>${car.price}</Text>
              </View>
              <Text style={styles.markerLabel}>{car.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Map controls */}
        <View style={styles.mapControls}>
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    position: 'relative',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  carMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -15 }, { translateY: -30 }],
  },
  markerDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4B4DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPrice: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  zoomControls: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WebMap;