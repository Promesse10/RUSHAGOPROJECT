import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Greetings
      morningGreeting: "Good Morning",
      afternoonGreeting: "Good Afternoon",
      eveningGreeting: "Good Evening",
      welcomeMessage: "Welcome to Rushago",

      // Search and Navigation
      searchPlaceholder: "Search location or car...",
      noCarsAvailable: "Car not yet available",
      carNotFound: "Car not found",
      perDay: "day",
      availableCars: "Available Cars",

      // Car Details
      carDetails: "Car Details",
      specifications: "Specifications",
      features: "Features",
      contactOwner: "Contact Owner",
      bookCar: "Book Car",
      shareCarDetails: "Share Car Details",
      accountRequired: "Account Required",
      accountRequiredMessage: "Please create an account to view shared car details",

      // Navigation
      turnByTurnNavigation: "Turn-by-Turn Navigation",
      expandMap: "Expand Map",
      minimizeMap: "Minimize Map",
      startNavigation: "Start Navigation",

      // Settings
      settings: "Settings",
      profile: "Profile",
      personalInfo: "Personal Information",
      name: "Name",
      address: "Address",
      telephone: "Telephone Number",
      changePassword: "Change Password",
      oldPassword: "Old Password",
      newPassword: "New Password",
      help: "Help",
      aboutApp: "About App",
      policy: "Privacy Policy",
      logout: "Logout",
      language: "Language",
      notifications: "Notifications",
      uploadPhoto: "Upload Photo",
      changePhoto: "Change Photo",

      // Contact alerts
      callAlert: "This call is about car rental business. Do you want to proceed?",
      messageAlert: "This message is about car rental business. Do you want to proceed?",
      whatsappAlert: "This WhatsApp message is about car rental business. Do you want to proceed?",

      // Directions
      getDirections: "Get Directions",
      distanceAway: "away from your location",

      // Reviews
      rateExperience: "Rate your experience",
      submitReview: "Submit Review",
      editReview: "Edit Review",
      thankYouReview: "Thank you for your review!",

      // Location
      enableLocation: "Enable Location",
      locationPermission: "Please allow location access to find nearest cars",
      trackNearestCar: "Track Nearest Car",

      // Common
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      yes: "Yes",
      no: "No",
      loading: "Loading...",
      update: "Update",
      done: "Done",
    },
  },
  rw: {
    translation: {
      morningGreeting: "Mwaramutse",
      afternoonGreeting: "Mwiriwe",
      eveningGreeting: "Muramuke",
      welcomeMessage: "Murakaza neza kuri Rushago",

      searchPlaceholder: "Shakisha ahantu cyangwa imodoka...",
      noCarsAvailable: "Nta modoka ihari ubu",
      carNotFound: "Nta modoka yabonetse",
      perDay: "umunsi",
      availableCars: "Amamodoka Ariho",

      carDetails: "Amakuru y'Imodoka",
      specifications: "Ibiranga",
      features: "Ibintu Bifite",
      contactOwner: "Vugana Nyirubwo",
      bookCar: "Gutumiza Imodoka",
      shareCarDetails: "Sangira Amakuru y'Imodoka",
      accountRequired: "Konti Ikenewe",
      accountRequiredMessage: "Nyabuna kora konti kugirango ubone amakuru y'imodoka yasangiwe",

      turnByTurnNavigation: "Kwerekana Inzira",
      expandMap: "Kwagura Ikarita",
      minimizeMap: "Kugabanya Ikarita",
      startNavigation: "Tangira Kwerekana Inzira",

      settings: "Igenamiterere",
      profile: "Umwirondoro",
      personalInfo: "Amakuru yUmuntu",
      name: "Izina",
      address: "Aderesi",
      telephone: "Nimero ya Telefoni",
      changePassword: "Hindura Ijambo Ryibanga",
      oldPassword: "Ijambo Ryibanga Ryashize",
      newPassword: "Ijambo Ryibanga Rishya",
      help: "Ubufasha",
      aboutApp: "Kuri Porogaramu",
      policy: "Politike yIbanga",
      logout: "Gusohoka",
      language: "Ururimi",
      notifications: "Ubutumwa",
      uploadPhoto: "Kohereza Ifoto",
      changePhoto: "Hindura Ifoto",

      callAlert: "Iki gihamagara kijyanye nubucuruzi bwo gukodesha imodoka. Urashaka gukomeza?",
      messageAlert: "Ubu butumwa bujyanye nubucuruzi bwo gukodesha imodoka. Urashaka gukomeza?",
      whatsappAlert: "Ubu butumwa bwa WhatsApp bujyanye nubucuruzi bwo gukodesha imodoka. Urashaka gukomeza?",

      getDirections: "Menya Inzira",
      distanceAway: "kure yawe",

      rateExperience: "Tanga igitekerezo",
      submitReview: "Ohereza Igitekerezo",
      editReview: "Hindura Igitekerezo",
      thankYouReview: "Murakoze kubyo mwatanze!",

      enableLocation: "Emera Aho Uri",
      locationPermission: "Nyabuna emera gukoresha aho uri kugirango tubone amamodoka yegereye",
      trackNearestCar: "Kurikirana Imodoka Yegereye",

      save: "Bika",
      cancel: "Kuraguza",
      close: "Gufunga",
      back: "Garuka",
      yes: "Yego",
      no: "Oya",
      loading: "Birimo gutegurwa...",
      update: "Kuvugurura",
      done: "Byarangiye",
    },
  },
  fr: {
    translation: {
      morningGreeting: "Bonjour",
      afternoonGreeting: "Bon après-midi",
      eveningGreeting: "Bonsoir",
      welcomeMessage: "Bienvenue à Rushago",

      searchPlaceholder: "Rechercher lieu ou voiture...",
      noCarsAvailable: "Voiture pas encore disponible",
      carNotFound: "Voiture non trouvée",
      perDay: "jour",
      availableCars: "Voitures Disponibles",

      carDetails: "Détails de la Voiture",
      specifications: "Spécifications",
      features: "Caractéristiques",
      contactOwner: "Contacter Propriétaire",
      bookCar: "Réserver Voiture",
      shareCarDetails: "Partager Détails de la Voiture",
      accountRequired: "Compte Requis",
      accountRequiredMessage: "Veuillez créer un compte pour voir les détails de voiture partagés",

      turnByTurnNavigation: "Navigation Étape par Étape",
      expandMap: "Agrandir Carte",
      minimizeMap: "Réduire Carte",
      startNavigation: "Commencer Navigation",

      settings: "Paramètres",
      profile: "Profil",
      personalInfo: "Informations Personnelles",
      name: "Nom",
      address: "Adresse",
      telephone: "Numéro de Téléphone",
      changePassword: "Changer Mot de Passe",
      oldPassword: "Ancien Mot de Passe",
      newPassword: "Nouveau Mot de Passe",
      help: "Aide",
      aboutApp: "À Propos",
      policy: "Politique de Confidentialité",
      logout: "Déconnexion",
      language: "Langue",
      notifications: "Notifications",
      uploadPhoto: "Télécharger Photo",
      changePhoto: "Changer Photo",

      callAlert: "Cet appel concerne la location de voiture. Voulez-vous continuer?",
      messageAlert: "Ce message concerne la location de voiture. Voulez-vous continuer?",
      whatsappAlert: "Ce message WhatsApp concerne la location de voiture. Voulez-vous continuer?",

      getDirections: "Obtenir Directions",
      distanceAway: "loin de votre position",

      rateExperience: "Évaluez votre expérience",
      submitReview: "Soumettre Avis",
      editReview: "Modifier Avis",
      thankYouReview: "Merci pour votre avis!",

      enableLocation: "Activer Localisation",
      locationPermission: "Veuillez autoriser l'accès à la localisation pour trouver les voitures les plus proches",
      trackNearestCar: "Suivre Voiture la Plus Proche",

      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      back: "Retour",
      yes: "Oui",
      no: "Non",
      loading: "Chargement...",
      update: "Mettre à jour",
      done: "Terminé",
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
