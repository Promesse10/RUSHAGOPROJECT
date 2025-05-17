"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Image } from "react-native"
import { ChevronLeft } from "react-native-feather"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage"

const languages = [
  { id: "en", name: "English (ENG)", flag: require("../../assets/united-kingdom.png") },
  { id: "rw", name: "Kinyarwanda", flag: require("../../assets/rwanda.png") },
  { id: "fr", name: "French", flag: require("../../assets/france.png") },
]

const Language = () => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLanguages, setFilteredLanguages] = useState(languages)

  // Load saved language on component mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("userLanguage")
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage)
          i18n.changeLanguage(savedLanguage)
        }
      } catch (error) {
        console.error("Error loading saved language:", error)
      }
    }

    loadSavedLanguage()
  }, [])

  const navigateBack = () => {
    navigation.goBack()
  }

  const handleSelectLanguage = async (langId) => {
    setSelectedLanguage(langId)

    // Save language preference
    try {
      await AsyncStorage.setItem("userLanguage", langId)
      // Change app language
      i18n.changeLanguage(langId)

      setTimeout(() => {
        navigation.goBack()
      }, 500)
    } catch (error) {
      console.error("Error saving language preference:", error)
    }
  }

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity style={styles.languageItem} onPress={() => handleSelectLanguage(item.id)}>
      <View style={styles.languageLeft}>
        <Image source={item.flag} style={styles.flag} />
        <Text style={styles.languageName}>{item.name}</Text>
      </View>
      <View style={[styles.radioButton, selectedLanguage === item.id && styles.radioButtonSelected]}>
        {selectedLanguage === item.id && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack}>
            <ChevronLeft width={24} height={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("language")}</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={filteredLanguages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.languageList}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  languageLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 30,
    height: 30, // Adjusted height to match width for a perfect circle
    borderRadius: 15, // Half of width/height for a circular shape
    marginRight: 15,
    resizeMode: "contain", // Ensures the image fits well within the circle
  },
  languageName: {
    fontSize: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#007EFD",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007EFD",
  },
})

export default Language