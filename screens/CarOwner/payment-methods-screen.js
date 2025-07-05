"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../CarOwner/ui/card"
import { Button } from "../CarOwner/ui/button"
import { RadioGroup, RadioGroupItem } from "../CarOwner/ui/radio-group"
import { CreditCard, ArrowLeft } from "lucide-react"
import { useApp } from "../CarOwner/page"

export function PaymentMethodsScreen() {
  // global app context
  const { isDarkMode, language, setShowPaymentMethods } = useApp()

  // local state – which payment option is selected
  const [method, setMethod] = useState("mtn")

  // simple i18n strings
  const i18n = {
    english: {
      title: "Payment Methods",
      momo: "MTN MoMo",
      card: "Credit / Debit Card",
      save: "Save",
      back: "Back",
      desc: "Choose your preferred payment method",
    },
    kinyarwanda: {
      title: "Uburyo bwo Kwishyura",
      momo: "MTN MoMo",
      card: "Ikadi",
      save: "Bika",
      back: "Subira",
      desc: "Hitamo uburyo bwo kwishyura",
    },
    french: {
      title: "Méthodes de Paiement",
      momo: "MTN MoMo",
      card: "Carte Bancaire",
      save: "Enregistrer",
      back: "Retour",
      desc: "Choisissez votre moyen de paiement",
    },
  }[language]

  return (
    <div className={`p-4 space-y-6 min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* header */}
      <div className="flex items-center space-x-3">
        <Button size="icon" variant="ghost" onClick={() => setShowPaymentMethods(false)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">{i18n.title}</h1>
      </div>

      {/* main card */}
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""} shadow-lg`}>
        <CardHeader>
          <CardTitle>{i18n.title}</CardTitle>
          <CardDescription>{i18n.desc}</CardDescription>
        </CardHeader>

        <CardContent>
          <RadioGroup value={method} onValueChange={setMethod} className="space-y-4">
            {/* MTN momo */}
            <label
              htmlFor="mtn"
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <RadioGroupItem value="mtn" id="mtn" />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTirHMs5lLQKt-KoNmHtl3TQ0ys-OYJLsUkw&s"
                alt="MTN MoMo"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">{i18n.momo}</span>
              <span className="ml-auto text-xs opacity-70">FRW</span>
            </label>

            {/* credit card */}
            <label
              htmlFor="card"
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="w-10 h-10 p-1 rounded-full bg-blue-100 text-[#007EFD]" />
              <span className="font-medium">{i18n.card}</span>
              <span className="ml-auto text-xs opacity-70">FRW</span>
            </label>
          </RadioGroup>

          {/* save button */}
          <Button
            className="w-full mt-6 bg-[#007EFD] hover:bg-[#0066CC]"
            onClick={() => {
              // Here you would normally persist the choice
              setShowPaymentMethods(false)
            }}
          >
            {i18n.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
