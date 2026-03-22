import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  StyleSheet,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const countries = [
  { code: "RW", name: "Rwanda", dial_code: "250" },
  { code: "UG", name: "Uganda", dial_code: "256" },
  { code: "KE", name: "Kenya", dial_code: "254" },
  { code: "TZ", name: "Tanzania", dial_code: "255" },
  { code: "US", name: "United States", dial_code: "1" },
  { code: "GB", name: "United Kingdom", dial_code: "44" },
  { code: "CA", name: "Canada", dial_code: "1" },
  { code: "NG", name: "Nigeria", dial_code: "234" },
  { code: "ZA", name: "South Africa", dial_code: "27" },
  { code: "IN", name: "India", dial_code: "91" },
  // Add more countries as needed
]

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return "" 
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

const PhoneNumberInput = ({
  value,
  onChangeText,
  onChangeFormattedText,
  defaultCountry = "RW",
  placeholder,
  containerStyle,
  inputStyle,
  ...rest
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.code === defaultCountry) || countries[0]
  )
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const anim = useMemo(() => new Animated.Value(0), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial_code.includes(q) ||
        c.code.toLowerCase().includes(q)
    )
  }, [search])

  const close = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setOpen(false))
  }

  const openModal = () => {
    setOpen(true)
    setSearch("")
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }

  const handleSelect = (country) => {
    setSelectedCountry(country)
    close()
    if (onChangeFormattedText) {
      onChangeFormattedText(`+${country.dial_code} ${value || ""}`)
    }
  }

  const handleChange = (text) => {
    onChangeText?.(text)
    if (onChangeFormattedText) {
      onChangeFormattedText(`+${selectedCountry.dial_code} ${text}`)
    }
  }

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  })

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity style={styles.selector} onPress={openModal} activeOpacity={0.8}>
        <Text style={styles.flag}>{getFlagEmoji(selectedCountry.code)}</Text>
        <Text style={styles.dialCode}>+{selectedCountry.dial_code}</Text>
        <Ionicons name="chevron-down" size={18} color="#555" style={styles.selectorIcon} />
      </TouchableOpacity>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder || "Phone number"}
        placeholderTextColor="#888"
        keyboardType={Platform.OS === "ios" ? "number-pad" : "phone-pad"}
        style={[styles.input, inputStyle]}
        {...rest}
      />

      <Modal visible={open} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={close} />
          <Animated.View
            style={[
              styles.modalContent,
              { opacity: anim, transform: [{ translateY }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select country</Text>
              <TouchableOpacity onPress={close}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                autoFocus
              />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.countryFlag}>{getFlagEmoji(item.code)}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDial}>+{item.dial_code}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingRight: 10,
  },
  flag: {
    fontSize: 18,
  },
  dialCode: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectorIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    fontSize: 16,
    color: "#333",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  countryFlag: {
    fontSize: 20,
  },
  countryInfo: {
    marginLeft: 12,
  },
  countryName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  countryDial: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
})

export default PhoneNumberInput
