"use client"

import { useState } from "react"
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import ImageViewer from "react-native-image-zoom-viewer"

const { width, height } = Dimensions.get("window")

const ImageGallery = ({ visible, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const imageUrls = images.map((image) => ({
    url: image,
    props: {
      source: { uri: image },
    },
  }))

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <ImageViewer
        imageUrls={imageUrls}
        index={currentIndex}
        onSwipeDown={onClose}
        enableSwipeDown={true}
        backgroundColor="rgba(0,0,0,0.9)"
        saveToLocalByLongPress={false}
        enablePreload={true}
        onChange={(index) => setCurrentIndex(index)}
        renderHeader={() => (
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        renderIndicator={(currentIndex, allSize) => (
          <View style={styles.indicator}>
            <View style={styles.indicatorContainer}>
              {Array.from({ length: allSize }, (_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === currentIndex - 1 ? styles.activeDot : styles.inactiveDot]}
                />
              ))}
            </View>
          </View>
        )}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  closeButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "white",
  },
  inactiveDot: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
})

export default ImageGallery
