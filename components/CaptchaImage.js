import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CaptchaImage = ({ text }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F2",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 4,
    color: "#007EFD",
  },
});

export default CaptchaImage;
