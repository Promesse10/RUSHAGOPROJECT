"use client"

import { createContext, useContext, useState } from "react"

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

const translations = {
  rw: {
    goodMorning: "Mwaramutse",
    goodAfternoon: "Mwiriwe",
    goodEvening: "Muramuke",
    welcomeMessage: "Murakaza neza kuri Rushago",
    findYourCar: "Shakisha imodoka yawe",
  },
  en: {
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    welcomeMessage: "Welcome to Rushago",
    findYourCar: "Find your car",
  },
  fr: {
    goodMorning: "Bonjour",
    goodAfternoon: "Bon après-midi",
    goodEvening: "Bonsoir",
    welcomeMessage: "Bienvenue à Rushago",
    findYourCar: "Trouvez votre voiture",
  },
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("rw")

  const setLanguage = (languageCode) => {
    setCurrentLanguage(languageCode)
  }

  const value = {
    currentLanguage,
    setLanguage,
    translations: translations[currentLanguage],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
