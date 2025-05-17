import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      searchForCar: 'Search for a car...',
      topChoice: 'Top Choice Cars',
      viewDetails: 'View Details',
      categories: {
        all: 'All',
        wedding: 'Wedding Cars',
        family: 'Family Trips',
        events: 'Events & VIP',
        casual: 'Casual & City',
        adventure: 'Adventure',
        business: 'Business',
        economy: 'Economy',
      },
      chooseAnyCarModel: 'Choose for Any Car Model',
      viewAll: 'View All',
      testDriveArea: 'Test Drive Area',
      testDriveSubtitle: 'Experience our cars with a free test drive!',
      viewCars: 'View Cars',
      availableCars: 'Available Cars',
      noAvailableCars: 'No cars available matching your criteria.',
      home: 'Home',
      bookings: 'Bookings',
      map: 'Map',
      settings: 'Settings',
      language: 'Language',
      searchLanguage: 'Search languages...',
      // New translations for car listings
      companies: 'Companies',
      cars: 'Cars',
      backToCompanies: 'Back to companies',
      recommended: 'Recommended',
      rentalPeriods: {
        perDay: '/day',
        perMonth: '/month'
      },
      fuelTypes: {
        diesel: 'Diesel',
        petrol: 'Petrol',
        electric: 'Electric'
      },
      transmissionTypes: {
        automatic: 'Automatic',
        manual: 'Manual'
      },
      carCount: {
        singular: 'car',
        plural: 'cars'
      },
      availability: {
        available: 'Available',
        unavailable: 'Unavailable'
      }
    },
  },
  fr: {
    translation: {
      searchForCar: 'Rechercher une voiture...',
      topChoice: 'Voitures de Premier Choix',
      viewDetails: 'Voir les détails',
      categories: {
        all: 'Tous',
        wedding: 'Voitures de Mariage',
        family: 'Voyages en Famille',
        events: 'Événements & VIP',
        casual: 'Casual & Ville',
        adventure: 'Aventure',
        business: 'Affaires',
        economy: 'Économie',
      },
      chooseAnyCarModel: 'Choisissez n\'importe quel modèle de voiture',
      viewAll: 'Voir tout',
      testDriveArea: 'Zone d\'Essai',
      testDriveSubtitle: 'Essayez nos voitures avec un essai gratuit !',
      viewCars: 'Voir les Voitures',
      availableCars: 'Voitures Disponibles',
      noAvailableCars: 'Aucune voiture ne correspond à vos critères.',
      home: 'Accueil',
      bookings: 'Réservations',
      map: 'Carte',
      settings: 'Paramètres',
      language: 'Langue',
      searchLanguage: 'Rechercher des langues...',
      // New translations for car listings
      companies: 'Entreprises',
      cars: 'Voitures',
      backToCompanies: 'Retour aux entreprises',
      recommended: 'Recommandé',
      rentalPeriods: {
        perDay: '/jour',
        perMonth: '/mois'
      },
      fuelTypes: {
        diesel: 'Diesel',
        petrol: 'Essence',
        electric: 'Électrique'
      },
      transmissionTypes: {
        automatic: 'Automatique',
        manual: 'Manuelle'
      },
      carCount: {
        singular: 'voiture',
        plural: 'voitures'
      },
      availability: {
        available: 'Disponible',
        unavailable: 'Indisponible'
      }
    },
  },
  rw: {
    translation: {
      searchForCar: 'Shakisha imodoka...',
      topChoice: 'Imodoka Zigaragara Neza',
      viewDetails: 'Reba Amakuru',
      categories: {
        all: 'Byose',
        wedding: 'Imodoka za Marita',
        family: 'Ibikubiyemo bya Famili',
        events: 'Ibintu bya VIP',
        casual: 'Casual & Umurwa',
        adventure: 'Ibikorwa bya Gutsinda',
        business: 'Ubucuruzi',
        economy: 'Ikigenga',
      },
      chooseAnyCarModel: 'Hitamo Umodoka Uwo Ariwe',
      viewAll: 'Reba Byose',
      testDriveArea: 'Zone y\'Igikoresho',
      testDriveSubtitle: 'Shakisha imodoka zacu ubu kugira ubone neza!',
      viewCars: 'Reba Imodoka',
      availableCars: 'Imodoka Zizwi',
      noAvailableCars: 'Nta modoka irashobora gukora.',
      home: 'Ahabanza',
      bookings: 'Kwinjiza',
      map: 'Igitabo',
      settings: 'Igenamiterere',
      language: 'Ururimi',
      searchLanguage: 'Shakisha ururimi...',
      // New translations for car listings
      companies: 'Ibigo',
      cars: 'Imodoka',
      backToCompanies: 'Subira ku bigo',
      recommended: 'Byarasabwe',
      rentalPeriods: {
        perDay: '/umunsi',
        perMonth: '/ukwezi'
      },
      fuelTypes: {
        diesel: 'Dizeli',
        petrol: 'Lisansi',
        electric: 'Amashanyarazi'
      },
      transmissionTypes: {
        automatic: 'Otomatiki',
        manual: 'Manueli'
      },
      carCount: {
        singular: 'imodoka',
        plural: 'imodoka'
      },
      availability: {
        available: 'Iraboneka',
        unavailable: 'Ntiboneka'
      }
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const I18nProvider = ({ children }) => {
  return children;
};

export default i18n;