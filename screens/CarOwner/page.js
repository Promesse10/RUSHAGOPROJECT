"use client"

import { useState, createContext, useContext } from "react"
import { BottomNavigation } from "../CarOwner/bottom-navigation"
import { DashboardScreen } from "../CarOwner/DashboardScreen"
import { MyCarsScreen } from "./PaymentMethodsScreen"
import { AddCarScreen } from "./AddCarScreen"
import { SettingsScreen } from "./SettingsScreen"
import { PaymentMethodsScreen } from "../CarOwner/payment-methods-screen"
import { CarDetailsModal } from "./MyCarsScreen"

const AppContext = createContext()

export function useApp() {
  return useContext(AppContext)
}

export default function CarRentalApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState("kinyarwanda")
  const [selectedCar, setSelectedCar] = useState(null)
  const [showCarDetails, setShowCarDetails] = useState(false)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)

  const translations = {
    english: {
      dashboard: "Dashboard",
      myCars: "My Cars",
      addCar: "Add Car",
      settings: "Settings",
      welcome: "Welcome back",
      totalCars: "Total Cars",
      active: "Active",
      pending: "Pending",
      quickStats: "Quick Stats",
      recentActivity: "Recent Activity",
      premiumPlan: "Premium Plan",
      addNewCar: "Add New Car",
      manageVehicles: "Manage your vehicle listings",
      currency: "FRW",
    },
    kinyarwanda: {
      dashboard: "Ikibaho",
      myCars: "Imodoka Zanjye",
      addCar: "Ongeraho Imodoka",
      settings: "Igenamiterere",
      welcome: "Murakaza neza",
      totalCars: "Imodoka Zose",
      active: "Zikora",
      pending: "Zitegereje",
      quickStats: "Imibare Yihuse",
      recentActivity: "Ibikorwa Bya Vuba",
      premiumPlan: "Gahunda ya Premium",
      addNewCar: "Ongeraho Imodoka Nshya",
      manageVehicles: "Genzura imodoka zawe",
      currency: "FRW",
    },
    french: {
      dashboard: "Tableau de Bord",
      myCars: "Mes Voitures",
      addCar: "Ajouter Voiture",
      settings: "Paramètres",
      welcome: "Bon retour",
      totalCars: "Total Voitures",
      active: "Actives",
      pending: "En Attente",
      quickStats: "Statistiques Rapides",
      recentActivity: "Activité Récente",
      premiumPlan: "Plan Premium",
      addNewCar: "Ajouter Nouvelle Voiture",
      manageVehicles: "Gérer vos annonces de véhicules",
      currency: "FRW",
    },
  }

  const t = translations[language]

  const contextValue = {
    activeTab,
    setActiveTab,
    isDarkMode,
    setIsDarkMode,
    language,
    setLanguage,
    translations: t,
    selectedCar,
    setSelectedCar,
    showCarDetails,
    setShowCarDetails,
    showPaymentMethods,
    setShowPaymentMethods,
  }

  const renderScreen = () => {
    if (showPaymentMethods) {
      return <PaymentMethodsScreen />
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen />
      case "cars":
        return <MyCarsScreen />
      case "add":
        return <AddCarScreen />
      case "settings":
        return <SettingsScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen pb-20 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
        <div className={`max-w-md mx-auto min-h-screen shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          {renderScreen()}
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {showCarDetails && <CarDetailsModal />}
        </div>
      </div>
    </AppContext.Provider>
  )
}
