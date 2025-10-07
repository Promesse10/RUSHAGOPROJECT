// app/screens/ResetPasswordScreen.js
import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { resetPasswordAction } from "../redux/action/AuthRecoveryActions"

const ResetPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params || {}
  const dispatch = useDispatch()
  const { isLoading, passwordReset, error } = useSelector((state) => state.authRecovery)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match")
      return
    }
    dispatch(resetPasswordAction({ token, newPassword }))
      .unwrap()
      .then(() => {
        Alert.alert("Success", "Password reset successful", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ])
      })
      .catch((err) => Alert.alert("Error", err))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>
      <TextInput
        style={styles.input}
        placeholder="New password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={isLoading}>
        <Text style={styles.btnText}>{isLoading ? "Resetting..." : "Reset Password"}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 10 },
  btn: { backgroundColor: "#007BFF", borderRadius: 10, padding: 15 },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
  error: { color: "red", marginTop: 10, textAlign: "center" },
})

export default ResetPasswordScreen
