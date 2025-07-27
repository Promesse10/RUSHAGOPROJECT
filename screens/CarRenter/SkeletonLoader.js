import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonLoader = ({ type = 'card' }) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  if (type === 'card') {
    return (
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.cardImage, shimmerStyle]} />
        <View style={styles.cardContent}>
          <Animated.View style={[styles.cardTitle, shimmerStyle]} />
          <Animated.View style={[styles.cardPrice, shimmerStyle]} />
        </View>
      </View>
    );
  }

  if (type === 'list') {
    return (
      <View style={styles.listContainer}>
        <Animated.View style={[styles.listImage, shimmerStyle]} />
        <View style={styles.listContent}>
          <Animated.View style={[styles.listTitle, shimmerStyle]} />
          <Animated.View style={[styles.listSubtitle, shimmerStyle]} />
          <Animated.View style={[styles.listPrice, shimmerStyle]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.defaultContainer}>
      <Animated.View style={[styles.defaultSkeleton, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardImage: {
    height: 180,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
    width: '70%',
  },
  cardPrice: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '50%',
  },
  listContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    marginRight: 15,
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listTitle: {
    height: 18,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '80%',
    marginBottom: 8,
  },
  listSubtitle: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '60%',
    marginBottom: 8,
  },
  listPrice: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '40%',
  },
  defaultContainer: {
    padding: 20,
  },
  defaultSkeleton: {
    height: 100,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
});

export default SkeletonLoader;