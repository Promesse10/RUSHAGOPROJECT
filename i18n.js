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
      },
    },
    fr: {
      translation: {
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
      },
    },
  },
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;