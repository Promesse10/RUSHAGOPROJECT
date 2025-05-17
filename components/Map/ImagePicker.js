import { View, TouchableOpacity, Image, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const ImagePicker = ({ image, onImageSelected, style }) => {
  const handleSelectImage = () => {
    // In a real app, this would use react-native-image-picker or expo-image-picker
    // For this example, we'll just simulate selecting an image
    onImageSelected(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png",
    )
  }

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handleSelectImage}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <MaterialIcons name="add-photo-alternate" size={24} color="#666666" />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ImagePicker

