"use client"
import { View, StyleSheet } from "react-native"

export function LoadingSkeleton({ style, className }) {
  return <View style={[styles.skeleton, style]} />
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    height: 80,
  },
})
