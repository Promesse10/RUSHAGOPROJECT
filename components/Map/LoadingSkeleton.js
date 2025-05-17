"use client"

import { useEffect, useRef } from "react"
import { StyleSheet, Animated } from "react-native"

const LoadingSkeleton = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [opacity])

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
})

export default LoadingSkeleton

