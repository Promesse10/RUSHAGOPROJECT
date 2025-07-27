import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  resources: {
    en: {
      translation: {
        dashboard: "Dashboard",
        welcome: "Welcome back",
        totalCars: "Total Cars",
        active: "Active",
        pending: "Pending",
        auditApproved: "Your Audi Q7 listing was approved",
        hoursAgo: "2 hours ago",
        bmwViews: "BMW X5 received 12 new views",
        hoursAgo5: "5 hours ago",
        mercedesInquiry: "New inquiry for Mercedes GLE",
        dayAgo: "1 day ago",
        enterCarName: "Enter new car name...",
        add: "Add",
        quickStats: "Quick Stats",
        recentActivity: "Recent Activity",
        goodMorning: "Good Morning",
        goodAfternoon: "Good Afternoon",
        goodEvening: "Good Evening",
        welcomeToRushago: "Welcome to Rushago",
  
        // Navigation
        home: "Home",
        cars: "Cars",
        settings: "Settings",
  
        // Car Details
        carDetails: "Car Details",
        about: "About",
        gallery: "Gallery",
        review: "Review",
        rentPartner: "Rent Partner",
        owner: "Owner",
        specification: "Specification",
        seats: "Seats",
        price: "Price",
        bookNow: "Book Now",
  
        // Search & Filter
        findYourCar: "Find your car",
        searchCars: "Search cars...",
        filterCars: "Filter Cars",
        clearAll: "Clear All",
        applyFilters: "Apply Filters",
  
        // Status
        available: "Available",
        notAvailable: "Not Available",
        tracking: "Tracking",
        findingNearestCar: "Finding nearest available car...",
        locationRequired: "Location Required",
        enableLocation: "Please enable location services",
  
        // Sharing
        checkOutCar: "Check out this",
        forRent: "for rent at",
  
        // Review
        reviewText:
          "Great car with excellent condition. The owner is very responsive and helpful. Highly recommended for family trips!",
      },
    },
    fr: {
      translation: {
        // Greetings
      goodMorning: "Bonjour",
      goodAfternoon: "Bon après-midi",
      goodEvening: "Bonsoir",
      welcomeToRushago: "Bienvenue à Rushago",

      // Navigation
      home: "Accueil",
      cars: "Voitures",
      settings: "Paramètres",

      // Car Details
      carDetails: "Détails de la voiture",
      about: "À propos",
      gallery: "Galerie",
      review: "Avis",
      rentPartner: "Partenaire de location",
      owner: "Propriétaire",
      specification: "Spécification",
      seats: "Sièges",
      price: "Prix",
      bookNow: "Réserver maintenant",

      // Search & Filter
      findYourCar: "Trouvez votre voiture",
      searchCars: "Rechercher des voitures...",
      filterCars: "Filtrer les voitures",
      clearAll: "Tout effacer",
      applyFilters: "Appliquer les filtres",

      // Status
      available: "Disponible",
      notAvailable: "Non disponible",
      tracking: "Suivi",
      findingNearestCar: "Recherche de la voiture disponible la plus proche...",
      locationRequired: "Localisation requise",
      enableLocation: "Veuillez activer les services de localisation",

      // Sharing
      checkOutCar: "Découvrez cette",
      forRent: "à louer à",

      // Review
      reviewText:
        "Excellente voiture en excellent état. Le propriétaire est très réactif et serviable. Hautement recommandé pour les voyages en famille!",
        dashboard: "Tableau de bord",
        welcome: "Bon retour",
        totalCars: "Voitures totales",
        active: "Actif",
        pending: "En attente",
        auditApproved: "Votre annonce Audi Q7 a été approuvée",
        hoursAgo: "il y a 2 heures",
        bmwViews: "BMW X5 a reçu 12 nouvelles vues",
        hoursAgo5: "il y a 5 heures",
        mercedesInquiry: "Nouvelle demande pour Mercedes GLE",
        dayAgo: "il y a 1 jour",
        enterCarName: "Entrez le nom de la nouvelle voiture...",
        add: "Ajouter",
        quickStats: "Statistiques rapides",
        recentActivity: "Activité récente",
      },
    },
    rw: {
      translation: {
        dashboard: "Dashboard",
        welcome: "Murakaza neza",
        totalCars: "Imodoka zose",
        active: "Zikora",
        pending: "Zitegereje",
        auditApproved: "Imodoka yawe Audi Q7 yemerewe",
        hoursAgo: "Amasaha 2 ashize",
        bmwViews: "BMW X5 yabonye abantu bashya 12",
        hoursAgo5: "Amasaha 5 ashize",
        mercedesInquiry: "Hari uwashatse kumenya kuri Mercedes GLE",
        dayAgo: "Umunsi 1 ushize",
        enterCarName: "Andika izina ry'imodoka nshya...",
        add: "Ongeraho",
        quickStats: "Imibare yihuse",
        recentActivity: "Ibikorwa biheruka",
        goodMorning: "Mwaramutse",
        goodAfternoon: "Mwiriwe",
        goodEvening: "Muramuke",
        welcomeToRushago: "Murakaza neza kuri Rushago",
  
        // Navigation
        home: "Ahabanza",
        cars: "Imodoka",
        settings: "Igenamiterere",
  
        // Car Details
        carDetails: "Amakuru y'imodoka",
        about: "Ibijyanye",
        gallery: "Amafoto",
        review: "Isuzuma",
        rentPartner: "Umunyeshyiramo",
        owner: "Nyir'imodoka",
        specification: "Ibisobanuro",
        seats: "Intebe",
        price: "Igiciro",
        bookNow: "Gena ubu",
  
        // Search & Filter
        findYourCar: "Shakisha imodoka yawe",
        searchCars: "Shakisha imodoka",
        filterCars: "Shyungura imodoka",
        clearAll: "Siba byose",
        applyFilters: "Koresha ishyungura",
  
        // Status
        available: "Irahari",
        notAvailable: "Ntirahari",
        tracking: "Gukurikirana",
        findingNearestCar: "Turashakisha imodoka iri hafi",
        locationRequired: "Ahantu hakenewe",
        enableLocation: "Nyamuneka emera serivisi z'ahantu",
  
        // Sharing
        checkOutCar: "Reba iyi modoka",
        forRent: "yo gukodesha ku",
  
        // Review
        reviewText:
          "Imodoka nziza ifite imiterere myiza. Nyir'imodoka asubiza vuba kandi afasha. Turayisaba cyane ku rugendo rw'umuryango!",
      },
    },
  },
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;