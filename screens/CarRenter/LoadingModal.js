"use client"

import { Modal, View, Text, StyleSheet, Image, Dimensions } from "react-native"

const { width, height } = Dimensions.get("window")

const LoadingModal = ({ visible, message = "Loading available cars..." }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={{
              uri: "https://cdn.dribbble.com/userupload/23750459/file/original-5152c730a3efe2fccbce7790929ea3db.gif",
            }}
            style={styles.loadingGif}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: width * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingGif: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
})

export default LoadingModal
