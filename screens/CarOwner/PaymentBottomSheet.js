"use client"

import React, { useState, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useDispatch } from "react-redux"
import { processPayment } from "../../redux/action/CarActions"

const PaymentBottomSheet = ({ isVisible, onClose, onPaymentSuccess, amount = 5000 }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("credit")
  const [cardData, setCardData] = useState({
    number: "",
    holderName: "",
    expiryDate: "",
    cvv: "",
    setAsDefault: false,
  })
  const [mtnData, setMtnData] = useState({
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(false)

  const slideAnim = useRef(new Animated.Value(0)).current
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start()
    }
  }, [isVisible])

  const handlePayment = async () => {
    setLoading(true)
    try {
      let paymentData = {
        amount,
        method: selectedPaymentMethod,
      }

      if (selectedPaymentMethod === "credit" || selectedPaymentMethod === "debit") {
        if (!cardData.number || !cardData.holderName || !cardData.expiryDate || !cardData.cvv) {
          Alert.alert("Error", "Please fill all card details")
          setLoading(false)
          return
        }
        paymentData = { ...paymentData, cardData }
      } else if (selectedPaymentMethod === "mtn") {
        if (!mtnData.phoneNumber) {
          Alert.alert("Error", "Please enter your MTN phone number")
          setLoading(false)
          return
        }
        paymentData = { ...paymentData, mtnData }
      }

      const result = await dispatch(processPayment(paymentData)).unwrap()

      if (result.success) {
        Alert.alert("Success", "Payment completed successfully!")
        onPaymentSuccess(result)
        onClose()
      }
    } catch (error) {
      Alert.alert("Payment Failed", error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const PaymentMethodButton = ({ method, title, icon, selected, onPress }) => (
    <TouchableOpacity style={[styles.paymentMethod, selected && styles.selectedPaymentMethod]} onPress={onPress}>
      <View style={styles.paymentMethodContent}>
        <Ionicons name={icon} size={24} color={selected ? "#4F46E5" : "#6B7280"} />
        <Text style={[styles.paymentMethodText, selected && styles.selectedPaymentMethodText]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={selected ? "#4F46E5" : "#6B7280"} />
    </TouchableOpacity>
  )

  if (!isVisible) return null

  return (
    <Modal transparent visible={isVisible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handle} />

          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.title}>Payment Details</Text>
              <TouchableOpacity style={styles.infoButton}>
                <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>{amount.toLocaleString()} RWF</Text>
            </View>

            <View style={styles.paymentMethodsContainer}>
              <Text style={styles.sectionTitle}>Select Payment Method</Text>

              <PaymentMethodButton
                method="credit"
                title="Credit Card"
                icon="card"
                selected={selectedPaymentMethod === "credit"}
                onPress={() => setSelectedPaymentMethod("credit")}
              />

              <PaymentMethodButton
                method="debit"
                title="Debit Card"
                icon="card-outline"
                selected={selectedPaymentMethod === "debit"}
                onPress={() => setSelectedPaymentMethod("debit")}
              />

              <PaymentMethodButton
                method="mtn"
                title="MTN Mobile Money"
                icon="phone-portrait"
                selected={selectedPaymentMethod === "mtn"}
                onPress={() => setSelectedPaymentMethod("mtn")}
              />
            </View>

            {(selectedPaymentMethod === "credit" || selectedPaymentMethod === "debit") && (
              <View style={styles.cardForm}>
                <Text style={styles.sectionTitle}>Card Details</Text>

                <View style={styles.cardBrandsContainer}>
                  <View style={styles.cardBrand}>
                    <Text style={styles.cardBrandText}>VISA</Text>
                  </View>
                  <View style={styles.cardBrand}>
                    <Text style={styles.cardBrandText}>MC</Text>
                  </View>
                  <View style={styles.cardBrand}>
                    <Text style={styles.cardBrandText}>AMEX</Text>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="XXXX XXXXXX X1234"
                    value={cardData.number}
                    onChangeText={(text) => setCardData({ ...cardData, number: text })}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Card Holder's Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="James Holder"
                    value={cardData.holderName}
                    onChangeText={(text) => setCardData({ ...cardData, holderName: text })}
                  />
                </View>

                <View style={styles.rowContainer}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YYYY"
                      value={cardData.expiryDate}
                      onChangeText={(text) => setCardData({ ...cardData, expiryDate: text })}
                      keyboardType="numeric"
                      maxLength={7}
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>CVC/CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="XXX"
                      value={cardData.cvv}
                      onChangeText={(text) => setCardData({ ...cardData, cvv: text })}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setCardData({ ...cardData, setAsDefault: !cardData.setAsDefault })}
                >
                  <Ionicons name={cardData.setAsDefault ? "checkbox" : "checkbox-outline"} size={24} color="#4F46E5" />
                  <Text style={styles.checkboxText}>Set as default card</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedPaymentMethod === "mtn" && (
              <View style={styles.mtnForm}>
                <Text style={styles.sectionTitle}>MTN Mobile Money</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="078XXXXXXX"
                    value={mtnData.phoneNumber}
                    onChangeText={(text) => setMtnData({ ...mtnData, phoneNumber: text })}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={loading}
            >
              <Text style={styles.payButtonText}>{loading ? "Processing..." : "Pay Now"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  infoButton: {
    padding: 8,
  },
  amountContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  paymentMethodsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  paymentMethod: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedPaymentMethod: {
    borderColor: "#4F46E5",
    backgroundColor: "#F0F9FF",
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 12,
  },
  selectedPaymentMethodText: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  cardForm: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  mtnForm: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardBrandsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 16,
  },
  cardBrand: {
    width: 50,
    height: 30,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cardBrandText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  rowContainer: {
    flexDirection: "row",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default PaymentBottomSheet
