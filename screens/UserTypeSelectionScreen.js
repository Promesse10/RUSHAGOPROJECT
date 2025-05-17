import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const UserTypeSelectionScreen = ({ navigation }) => {
  const handleUserTypeSelection = (type) => {
    if (type === "owner") {
      navigation.navigate("PhoneAuth")
    } else {
      navigation.navigate("SignUp")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Account Type</Text>
      <TouchableOpacity style={[styles.button, styles.ownerButton]} onPress={() => handleUserTypeSelection("owner")}>
        <Text style={styles.buttonText}>Car Owner</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.renterButton]} onPress={() => handleUserTypeSelection("renter")}>
        <Text style={styles.buttonText}>Car Renter</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  ownerButton: {
    backgroundColor: "#007EFD",
  },
  renterButton: {
    backgroundColor: "#007EFD",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default UserTypeSelectionScreen

