"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

const PaymentMethodsScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })
  const [phoneNumber, setPhoneNumber] = useState("+250 ")

  const paymentMethods = [
    {
      id: "card",
      name: t("creditCard", "Credit / Debit Card"),
      icon: "card-outline",
      color: "#007EFD",
    },
    {
      id: "mtn",
      name: "MTN MoMo",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTirHMs5lLQKt-KoNmHtl3TQ0ys-OYJLsUkw&s",
      color: "#FFCC00",
    },
  ]

  const handleSave = () => {
    if (selectedMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        Alert.alert("Error", "Please fill in all card details")
        return
      }
    } else if (selectedMethod === "mtn") {
      if (!phoneNumber || phoneNumber.length < 13) {
        Alert.alert("Error", "Please enter a valid phone number")
        return
      }
    }

    Alert.alert("Success", t("paymentMethodSaved", "Payment method saved successfully!"))
    navigation.goBack()
  }

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "")
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(" ") : cleaned
  }

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4)
    }
    return cleaned
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("paymentMethods", "Payment Methods")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t("paymentMethods", "Payment Methods")}</Text>
            <Text style={styles.cardSubtitle}>{t("choosePaymentMethod", "Choose your preferred payment method")}</Text>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodItem, selectedMethod === method.id && styles.methodItemSelected]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.radioButton}>
                  {selectedMethod === method.id && <View style={styles.radioButtonInner} />}
                </View>

                <View style={styles.methodIcon}>
                  {method.icon.startsWith("http") ? (
                    <Image source={{ uri: method.icon }} style={styles.methodImage} />
                  ) : (
                    <View style={[styles.cardIconContainer, { backgroundColor: `${method.color}15` }]}>
                      <Ionicons name={method.icon} size={24} color={method.color} />
                    </View>
                  )}
                </View>

                <Text style={styles.methodName}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Details Form */}
          <View style={styles.paymentDetails}>
            {selectedMethod === "card" && (
              <View style={styles.cardForm}>
                <Text style={styles.formTitle}>Card Details</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t("cardholderName", "Cardholder Name")}</Text>
                  <TextInput
                    style={styles.input}
                    value={cardDetails.cardholderName}
                    onChangeText={(text) => setCardDetails({ ...cardDetails, cardholderName: text })}
                    placeholder="John Doe"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t("cardNumber", "Card Number")}</Text>
                  <TextInput
                    style={styles.input}
                    value={cardDetails.cardNumber}
                    onChangeText={(text) => {
                      const formatted = formatCardNumber(text)
                      if (formatted.length <= 19) {
                        setCardDetails({ ...cardDetails, cardNumber: formatted })
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t("expiryDate", "Expiry Date")}</Text>
                    <TextInput
                      style={styles.input}
                      value={cardDetails.expiryDate}
                      onChangeText={(text) => {
                        const formatted = formatExpiryDate(text)
                        if (formatted.length <= 5) {
                          setCardDetails({ ...cardDetails, expiryDate: formatted })
                        }
                      }}
                      placeholder="MM/YY"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t("cvv", "CVV")}</Text>
                    <TextInput
                      style={styles.input}
                      value={cardDetails.cvv}
                      onChangeText={(text) => {
                        if (text.length <= 3) {
                          setCardDetails({ ...cardDetails, cvv: text })
                        }
                      }}
                      placeholder="123"
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}

            {selectedMethod === "mtn" && (
              <View style={styles.mtnForm}>
                <Text style={styles.formTitle}>MTN Mobile Money</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t("phoneNumber", "Phone Number")}</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="+250 788 123 456"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.mtnInfo}>
                  <Ionicons name="information-circle-outline" size={20} color="#007EFD" />
                  <Text style={styles.infoText}>You will receive a prompt on your phone to complete the payment</Text>
                </View>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("save", "Save")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  methodsList: {
    padding: 20,
    gap: 16,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  methodItemSelected: {
    borderColor: "#007EFD",
    backgroundColor: "#F0F9FF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007EFD",
  },
  methodIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  methodImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  paymentDetails: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cardForm: {
    gap: 16,
  },
  mtnForm: {
    gap: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
  },
  label: {
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
    color: "#111827",
  },
  mtnInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EBF8FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
  },
  saveButton: {
    margin: 20,
    backgroundColor: "#007EFD",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default PaymentMethodsScreen
