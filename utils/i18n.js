import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  rw: {
    translation: {
      // Dashboard
      dashboard: "Imbonerahamwe",
      welcome: "Murakaza neza",
      totalCars: "Ibinyabiziga byose",
      active: "Bikora",
      pending: "Bitegereje",
      quickStats: "Imibare y'ibanze",
      recentActivity: "Ibikorwa bya vuba",
      enterCarName: "Andika ubwoko bw'imodoka (urugero: Toyota, BMW)...",
      add: "Ongeraho",
      notifications: "Amakuru",

      // Settings
      settings: "Igenamiterere",
      manageAccount: "Gucunga konti yawe n'ibyo uhitamo",
      personalInformation: "Amakuru y'umuntu ku giti cye",
      fullName: "Amazina yose",
      email: "Imeyili",
      phone: "Telefoni",
      appSettings: "Igenamiterere rya App",
      darkMode: "Ubwoba bw'ijoro",
      enableDarkTheme: "Gushyira ahagaragara ubwoba bw'ijoro",
      receiveNotifications: "Kwakira amakuru y'ibanze",
      paymentMethods: "Uburyo bwo kwishyura",
      savedDrafts: "Inyandiko zibitswe",
      privacySecurity: "Ibanga n'umutekano",
      saveChanges: "Bika impinduka",
      logout: "Gusohoka",
      loading: "Birashakisha...",
      profileSaved: "Umwirondoro wabitswe neza!",
      premium: "Premium",
      memberSince: "Umunyamuryango kuva",
      premiumPlanActive: "Gahunda ya Premium ikora",
      expiresIn: "Irangira mu minsi 25",
      managePlan: "Gucunga gahunda",

      // My Cars Screen
      myCars: "Ibinyabiziga byanjye",
      manageVehicles: "Gucunga ibinyabiziga byawe",
      currency: "FRW",
      perDay: "ku munsi",
      views: "abareba",
      available: "Iraboneka",
      unavailable: "Ntiboneka",
      viewDetails: "Reba amakuru",
      carDetails: "Amakuru y'imodoka",
      edit: "Hindura",
      type: "Ubwoko",
      transmission: "Uburyo bwo guhindura",
      fuelType: "Ubwoko bw'amavuta",
      seats: "Intebe",
      location: "Ahantu",
      rating: "Amanota",
      features: "Ibintu bihari",
      description: "Ibisobanuro",

      // Add Car Screen
      addNewCar: "Ongeraho imodoka nshya",
      editCar: "Hindura imodoka",
      step: "Intambwe",
      of: "kuri",
      basicInformation: "Amakuru y'ibanze",
      specifications: "Ibisobanuro",
      pricingAndPhotos: "Igiciro n'amafoto",
      reviewAndSubmit: "Reba hanyuma wohereze",
      reviewChanges: "Reba impinduka",
      basicInfo: "Amakuru y'ibanze",
      pricing: "Igiciro",
      review: "Reba",

      // Form Fields
      make: "Ubwoko",
      selectMake: "Hitamo ubwoko",
      year: "Umwaka",
      selectYear: "Hitamo umwaka",
      customMake: "Ubwoko bwihariye",
      enterMakeName: "Andika izina ry'ubwoko",
      selectType: "Hitamo ubwoko",
      phoneNumber: "Nimero ya telefoni",
      ownerType: "Ubwoko bw'umwene",
      individual: "Umuntu ku giti cye",
      company: "Ikigo",
      companyName: "Izina ry'ikigo",
      enterCompanyName: "Andika izina ry'ikigo",
      companyPhone: "Telefoni y'ikigo",

      // Specifications
      selectTransmission: "Hitamo uburyo bwo guhindura",
      selectFuelType: "Hitamo ubwoko bw'amavuta",
      selectSeats: "Hitamo intebe",
      featuresOptional: "Ibintu bihari (Bitari ngombwa)",

      // Features
      airConditioning: "Gukonja ubushyuhe",
      gpsNavigation: "GPS",
      bluetooth: "Bluetooth",
      usbCharging: "Gushyira amashanyarazi USB",
      backupCamera: "Kamera y'inyuma",
      sunroof: "Umuryango w'iziko",
      leatherSeats: "Intebe z'uruhu",
      heatedSeats: "Intebe zishyushye",
      premiumSound: "Amajwi meza",
      keylessEntry: "Kwinjira nta nsabwa",
      cruiseControl: "Kugenzura umuvuduko",
      parkingSensors: "Ibikoresha byo guhagarika",
      wifiHotspot: "WiFi",
      appleCarPlay: "Apple CarPlay",
      androidAuto: "Android Auto",
      laneAssist: "Gufasha mu nzira",

      // Location
      address: "Aderesi",
      selectLocation: "Hitamo ahantu",
      mapWillAppear: "Ikarita izagaragara hano",
      clickToSelect: "Kanda kugira ngo uhitemo ahantu",
      categories: "Ibyiciro",

      // Categories
      economy: "Ubukungu",
      compact: "Nto",
      midSize: "Hagati",
      fullSize: "Nini",
      luxury: "Byiza cyane",
      sports: "Siporo",
      family: "Umuryango",
      business: "Ubucuruzi",
      wedding: "Ubukwe",
      airportTransfer: "Gutwara ku kibuga cy'indege",

      // Pricing
      pricingType: "Ubwoko bw'igiciro",
      selectPricing: "Hitamo igiciro",
      daily: "Buri munsi",
      weekly: "Buri cyumweru",
      monthly: "Buri kwezi",
      perWeek: "ku cyumweru",
      perMonth: "ku kwezi",
      price: "Igiciro",

      // Photos
      carPhotosRequired: "Amafoto y'imodoka (4 asabwa)",
      uploadAllPhotos: "Nyamuneka shyira amafoto yose 4 asabwa",
      frontExterior: "Imbere hanze",
      sideExterior: "Kuruhande hanze",
      rearExterior: "Inyuma hanze",
      interior: "Imbere",
      choose: "Hitamo",
      note: "Icyitonderwa",
      thumbnailNote: "Ifoto ntoya izahitanwa n'ikigo mbere y'uko iyandikwa rigaragara.",

      // Review
      reviewChangesBeforeUpdate: "Nyamuneka reba impinduka mbere yo kuvugurura",
      reviewDetailsBeforeSubmit: "Nyamuneka reba amakuru y'imodoka mbere yo kohereza",
      carSummary: "Incamake y'imodoka",
      car: "Imodoka",
      selected: "byahiswemo",
      photos: "Amafoto",
      uploaded: "yashyizweho",
      changesWillBeSaved: " Impinduka zawe zizabikwa kandi iyandikwa rizavugururwa ako kanya.",
      listingWillBeReviewed:
        " Iyandikwa ryawe rizasuzumwa mu masaha 24. Uzahabwa ubutumwa iyo ryemerewe kandi rigaragara.",

      // Navigation
      previous: "Ibanziriza",
      next: "Ikurikira",
      saveDraft: "Bika inyandiko",
      saveChanges: "Bika impinduka",
      submitListing: "Ohereza iyandikwa",

      // Alerts
      requiredFields: "Ibisabwa",
      fillRequiredFields: "Nyamuneka uzuza ibisabwa byose",
      draftSaved: "Inyandiko yabitswe",
      carListingSaved: "Iyandikwa ry'imodoka ryabitswe nk'inyandiko.",
      success: "Byagenze neza!",
      carListingUpdated: "Iyandikwa ry'imodoka ryavuguruwe neza!",
      carListingSubmitted: "Iyandikwa ry'imodoka ryoherejwe neza!",
      ok: "Sawa",

      // Image Picker
      permissionNeeded: "Uruhushya rusabwa",
      grantCameraPermission: "Nyamuneka tanga uruhushya rwo gufata amafoto.",
      selectPhoto: "Hitamo ifoto",
      choosePhotoMethod: "Hitamo uburyo bwo kongeraho ifoto",
      camera: "Kamera",
      gallery: "Ububiko",
      cancel: "Kuraguza",
      error: "Ikosa",
      addressNotFound: "Aderesi ntiyabonetse. Nyamuneka ongera ugerageze.",

      // Time expressions
      minutesAgo: "iminota {{count}} ishize",
      hoursAgo: "amasaha {{count}} ashize",
      hoursAgo3: "amasaha 3 ashize",
      hoursAgo5: "amasaha 5 ishize",
      dayAgo: "umunsi 1 ushize",
      daysAgo: "iminsi {{count}} ishize",
      daysAgo3: "iminsi 3 ishize",

      // Activities
      auditApproved: "Audi Q7 yawe yemewe",
      bmwViews: "BMW X5 yabonye abantu 12 bashya",
      mercedesInquiry: "Ikibazo gishya kuri Mercedes GLE",

      // Notifications
      updateCarAvailability: "Kuvugurura kuboneka kw'imodoka",
      updateCarMessage: "Kuvugurura kuboneka kwa BMW X5 yawe",
      updateCarFullMessage:
        "Mwaramutse! Ni byiza kuvugurura buri gihe kuboneka kw'imodoka yawe BMW X5 kugira ngo abakiriya babone neza igihe ishobora gukoreshwa.",

      listingApproved: "Iyandikwa ryemewe",
      approvedMessage: "Audi Q7 yawe yemerewe kandi iragaragara",
      approvedFullMessage:
        "Amakuru meza! Audi Q7 yawe yemerewe kandi ubu iragaragara kuri RushGo. Abakiriya bashobora kubona no kuyigurisha.",

      newBooking: "Gusaba gushya kw'ikodesha",
      bookingMessage: "Umuntu ashaka gukodesha BMW X5 yawe",
      bookingFullMessage:
        "Jean Uwimana asabye gukodesha BMW X5 yawe iminsi 3 kuva ku ya 15-17 Werurwe 2024. Igiciro cyose ni 150,000 FRW.",

      paymentReceived: "Kwishyura byakiriwe",
      paymentMessage: "Kwishyura kwa 120,000 FRW byakiriwe",
      paymentFullMessage:
        "Wakiriye kwishyura kwa 120,000 FRW kubera gukodesha Mercedes GLE yawe. Amafaranga yatanzwe kandi azohererezwa kuri konti yawe mu minsi 2-3 y'akazi.",

      maintenanceReminder: "Kwibutsa ubusugire",
      maintenanceMessage: "BMW X5 ikeneye ubusugire vuba",
      maintenanceFullMessage:
        "BMW X5 yawe ikeneye ubusugire. Nyamuneka witondere ko imodoka yawe isuzumwa neza kugira ngo utange serivisi nziza ku bakiriya.",

      reviewReceived: "Igitekerezo gishya",
      reviewMessage: "Wahawe inyenyeri 5 mu gitekerezo",
      reviewFullMessage:
        "Marie Mukamana yaguha inyenyeri 5 kuri Toyota Camry yawe: 'Imodoka nziza cyane kandi serivisi nziza! Imodoka yari isukuye kandi yitabwaho neza. Ndayisaba cyane!'",

      // Navigation
      home: "Ahabanza",
       // Navigation
       next: "Komeza",
       previous: "Inyuma",
       submit: "Ohereza Inyandiko",
       save_changes: "Bika Impinduka",
       save_draft: "Bika Igishushanyo",
 
       // Steps
       step_vehicle: "Imodoka",
       step_owner: "Nyir'ubwite",
       step_location: "Ahantu",
       step_pricing: "Ibiciro",
       step_media: "Amafoto",
       step_review: "Subiramo",
 
       // Headers
       add_new_car: "Ongeraho Imodoka Nshya",
       edit_car: "Hindura Imodoka",
       step_of: "Intambwe {{current}} muri {{total}}",
 
       // Vehicle Information
       vehicle_information: "Amakuru y'Imodoka",
       make_required: "Ubwoko *",
       model_required: "Icyitegererezo *",
       year_required: "Umwaka *",
       type_required: "Ubwoko *",
       transmission_required: "Uburyo bwo Guhindura *",
       fuel_type_required: "Ubwoko bw'Amavuta *",
       seating_capacity_required: "Umubare w'Intebe *",
       features_optional: "Ibintu Byihariye (Bitari Ngombwa)",
 
       // Owner Information
       owner_information: "Amakuru y'Nyir'ubwite",
       owner_type: "Ubwoko bw'Nyir'ubwite",
       individual: "Umuntu ku Giti Cye",
       company: "Ikigo",
       full_name_required: "Amazina Yose *",
       company_name_required: "Izina ry'Ikigo *",
       phone_number_required: "Nimero ya Telefoni *",
 
       // Location
       location_details: "Amakuru y'Ahantu",
       province_required: "Intara *",
       address_required: "Aderesi *",
       country: "Igihugu",
       location_on_map_required: "Ahantu ku Ikarita *",
 
       // Pricing
       pricing_category: "Ibiciro n'Icyiciro",
       category_required: "Icyiciro *",
       base_price_required: "Igiciro cy'Ibanze ku Munsi (FRW) *",
       weekly_discount: "Igabanuka ry'Icyumweru (%)",
       monthly_discount: "Igabanuka ry'Ukwezi (%)",
 
       // Media
       upload_photos: "Shyiraho Amafoto",
       car_photos_required: "Amafoto y'Imodoka (4 Akenewe) *",
       interior_view: "Imbere y'Imodoka",
       front_exterior: "Hanze Imbere",
       side_exterior: "Hanze ku Ruhande",
       rear_exterior: "Hanze Inyuma",
       business_thumbnail: "Ifoto y'Ubucuruzi (Serivisi Yihariye)",
       choose: "Hitamo",
       upload_premium: "Shyiraho Byihariye",
 
       // Review
       review_submit: "Subiramo & Ohereza",
       review_changes: "Subiramo Impinduka",
 
       // Placeholders
       select_make: "Hitamo ubwoko",
       select_model: "Hitamo icyitegererezo",
       select_type: "Hitamo ubwoko",
       select_transmission: "Hitamo uburyo bwo guhindura",
       select_fuel_type: "Hitamo ubwoko bw'amavuta",
       select_seating_capacity: "Hitamo umubare w'intebe",
       select_category: "Hitamo icyiciro",
       select_province: "Hitamo intara",
       enter_address: "Injiza aderesi",
       tap_to_select_location: "Kanda kugira uhitemo ahantu",
 
       // Features
       air_conditioning: "Gukonjesha Umwuka",
       gps_navigation: "GPS Kuyobora",
       bluetooth: "Bluetooth",
       usb_charging: "Gushyira Amashanyarazi USB",
       backup_camera: "Kamera yo Gusubira Inyuma",
       sunroof: "Igisenge cy'Iziko",
       leather_seats: "Intebe z'Urushyi",
       heated_seats: "Intebe Zishyuha",
       premium_sound: "Ijwi Ryiza",
       keyless_entry: "Kwinjira Nta Rufunguzo",
       cruise_control: "Kugenzura Umuvuduko",
       parking_sensors: "Ibikoresha byo Guhagarika",
       wifi_hotspot: "WiFi Hotspot",
       apple_carplay: "Apple CarPlay",
       android_auto: "Android Auto",
       lane_assist: "Gufasha mu Nzira",
       automatic_emergency_braking: "Guhagarika mu Byihutirwa",
       blind_spot_monitoring: "Gukurikirana Ahantu Hataboneka",
       adaptive_cruise_control: "Kugenzura Umuvuduko Guhindagurika",
       "360_camera": "Kamera 360°",
       wireless_charging: "Gushyira Amashanyarazi Nta Nsinga",
       ventilated_seats: "Intebe Zihumeka",
       memory_seats: "Intebe Zibuka",
       panoramic_roof: "Igisenge Kinini",
       head_up_display: "Kwerekana Hejuru",
       night_vision: "Kureba mu Ijoro",
       massage_seats: "Intebe zo Gukanda",
       ambient_lighting: "Amatara Meza",
 
       // Validation
       required_fields: "Ibisabwa",
       fill_required_fields: "Nyamuneka uzuza ibisabwa byose neza",
       invalid_name: "Nyamuneka injiza izina ryemewe (inyuguti, imyanya, utudomo, apostrophe gusa)",
       invalid_phone: "Nyamuneka injiza imibare 10 gusa",
       select_location_map: "Nyamuneka hitamo ahantu ku ikarita",
       upload_all_photos: "Nyamuneka shyiraho amafoto 4 asabwa yose",
 
       // Payment
       premium_thumbnail_upload: "Gushyiraho Ifoto Yihariye",
       amount: "Amafaranga: 5,000 FRW",
       choose_payment_method: "Hitamo Uburyo bwo Kwishyura:",
       mtn_momo: "MTN MOMO",
       credit_card: "Ikarita y'Inguzanyo",
       phone_number: "Nimero ya Telefoni",
       card_number: "Nimero y'Ikarita",
       cardholder_name: "Izina ry'Nyir'ikarita",
       expiry_date: "Itariki yo Kurangira",
       cvv: "CVV",
       confirm_payment: "Emeza Kwishyura",
 
       // Success Messages
       success: "Byagenze Neza!",
       listing_submitted: "Inyandiko yawe y'imodoka yoherejwe neza!",
       listing_updated: "Inyandiko yawe y'imodoka yavuguruwe neza!",
       payment_successful: "Kwishyura Byagenze Neza!",
       payment_processed: "Amafaranga yawe 5,000 FRW yishyuwe neza. Ubu ushobora gushyiraho ifoto yawe yihariye.",
 
       // Car Types
       sedan: "Sedan",
       suv: "SUV",
       hatchback: "Hatchback",
       coupe: "Coupe",
       convertible: "Convertible",
       pickup: "Pickup",
       van: "Van",
       minibus: "Minibus",
       crossover: "Crossover",
       station_wagon: "Station Wagon",
       truck: "Ikamyo",
       limousine: "Limousine",
       sports_car: "Imodoka y'Imikino",
       other: "Ikindi",
 
       // Transmission
       automatic: "Ikiyikora",
       manual: "Ikiyikorwa n'Ukuboko",
       cvt: "CVT",
       semi_automatic: "Igice cy'Ikiyikora",
 
       // Fuel Types
       gasoline: "Peteroli",
       diesel: "Mazutu",
       hybrid: "Bivanze",
       electric: "Amashanyarazi",
       cng: "CNG",
       lpg: "LPG",
 
       // Categories
       economy: "Ubukungu",
       compact: "Ntoya",
       mid_size: "Hagati",
       full_size: "Nini",
       premium: "Yihariye",
       luxury: "Y'Ubwiza",
       sports: "Y'Imikino",
       family: "Y'Umuryango",
       business: "Y'Ubucuruzi",
       wedding: "Y'Ubukwe",
       airport_transfer: "Gutwara ku Kibuga cy'Indege",
       off_road: "Mu Mashyamba",
       commercial: "Y'Ubucuruzi",
    },
  },
  en: {
    translation: {
       // Navigation
       next: "Next",
       previous: "Previous",
       submit: "Submit Listing",
       save_changes: "Save Changes",
       save_draft: "Save Draft",
 
       // Steps
       step_vehicle: "Vehicle",
       step_owner: "Owner",
       step_location: "Location",
       step_pricing: "Pricing",
       step_media: "Media",
       step_review: "Review",
 
       // Headers
       add_new_car: "Add New Car",
       edit_car: "Edit Car",
       step_of: "Step {{current}} of {{total}}",
 
       // Vehicle Information
       vehicle_information: "Vehicle Information",
       make_required: "Make *",
       model_required: "Model *",
       year_required: "Year *",
       type_required: "Type *",
       transmission_required: "Transmission *",
       fuel_type_required: "Fuel Type *",
       seating_capacity_required: "Seating Capacity *",
       features_optional: "Features (Optional)",
 
       // Owner Information
       owner_information: "Owner Information",
       owner_type: "Owner Type",
       individual: "Individual",
       company: "Company",
       full_name_required: "Full Name *",
       company_name_required: "Company Name *",
       phone_number_required: "Phone Number *",
 
       // Location
       location_details: "Location Details",
       province_required: "Province *",
       address_required: "Address *",
       country: "Country",
       location_on_map_required: "Location on Map *",
 
       // Pricing
       pricing_category: "Pricing & Category",
       category_required: "Category *",
       base_price_required: "Base Price per Day (FRW) *",
       weekly_discount: "Weekly Discount (%)",
       monthly_discount: "Monthly Discount (%)",
 
       // Media
       upload_photos: "Upload Photos",
       car_photos_required: "Car Photos (4 Required) *",
       interior_view: "Interior View",
       front_exterior: "Front Exterior",
       side_exterior: "Side Exterior",
       rear_exterior: "Rear Exterior",
       business_thumbnail: "Business Thumbnail (Premium Feature)",
       choose: "Choose",
       upload_premium: "Upload Premium",
 
       // Review
       review_submit: "Review & Submit",
       review_changes: "Review Changes",
 
       // Placeholders
       select_make: "Select make",
       select_model: "Select model",
       select_type: "Select type",
       select_transmission: "Select transmission",
       select_fuel_type: "Select fuel type",
       select_seating_capacity: "Select seating capacity",
       select_category: "Select category",
       select_province: "Select province",
       enter_address: "Enter address",
       tap_to_select_location: "Tap to select location",
 
       // Features
       air_conditioning: "Air Conditioning",
       gps_navigation: "GPS Navigation",
       bluetooth: "Bluetooth",
       usb_charging: "USB Charging",
       backup_camera: "Backup Camera",
       sunroof: "Sunroof",
       leather_seats: "Leather Seats",
       heated_seats: "Heated Seats",
       premium_sound: "Premium Sound",
       keyless_entry: "Keyless Entry",
       cruise_control: "Cruise Control",
       parking_sensors: "Parking Sensors",
       wifi_hotspot: "WiFi Hotspot",
       apple_carplay: "Apple CarPlay",
       android_auto: "Android Auto",
       lane_assist: "Lane Assist",
       automatic_emergency_braking: "Automatic Emergency Braking",
       blind_spot_monitoring: "Blind Spot Monitoring",
       adaptive_cruise_control: "Adaptive Cruise Control",
       "360_camera": "360° Camera",
       wireless_charging: "Wireless Charging",
       ventilated_seats: "Ventilated Seats",
       memory_seats: "Memory Seats",
       panoramic_roof: "Panoramic Roof",
       head_up_display: "Head-Up Display",
       night_vision: "Night Vision",
       massage_seats: "Massage Seats",
       ambient_lighting: "Ambient Lighting",
 
       // Validation
       required_fields: "Required Fields",
       fill_required_fields: "Please fill in all required fields correctly",
       invalid_name: "Please enter a valid name (letters, spaces, hyphens, apostrophes only)",
       invalid_phone: "Please enter exactly 10 digits",
       select_location_map: "Please select location on map",
       upload_all_photos: "Please upload all 4 required photos",
 
       // Payment
       premium_thumbnail_upload: "Premium Thumbnail Upload",
       amount: "Amount: 5,000 FRW",
       choose_payment_method: "Choose Payment Method:",
       mtn_momo: "MTN MOMO",
       credit_card: "Credit Card",
       phone_number: "Phone Number",
       card_number: "Card Number",
       cardholder_name: "Cardholder Name",
       expiry_date: "Expiry Date",
       cvv: "CVV",
       confirm_payment: "Confirm Payment",
 
       // Success Messages
       success: "Success!",
       listing_submitted: "Your car listing has been submitted successfully!",
       listing_updated: "Your car listing has been updated successfully!",
       payment_successful: "Payment Successful!",
       payment_processed:
         "Your payment of 5,000 FRW has been processed successfully. You can now upload your premium thumbnail.",
 
       // Car Types
       sedan: "Sedan",
       suv: "SUV",
       hatchback: "Hatchback",
       coupe: "Coupe",
       convertible: "Convertible",
       pickup: "Pickup",
       van: "Van",
       minibus: "Minibus",
       crossover: "Crossover",
       station_wagon: "Station Wagon",
       truck: "Truck",
       limousine: "Limousine",
       sports_car: "Sports Car",
       other: "Other",
 
       // Transmission
       automatic: "Automatic",
       manual: "Manual",
       cvt: "CVT",
       semi_automatic: "Semi-Automatic",
 
       // Fuel Types
       gasoline: "Gasoline",
       diesel: "Diesel",
       hybrid: "Hybrid",
       electric: "Electric",
       cng: "CNG",
       lpg: "LPG",
 
       // Categories
       economy: "Economy",
       compact: "Compact",
       mid_size: "Mid-size",
       full_size: "Full-size",
       premium: "Premium",
       luxury: "Luxury",
       sports: "Sports",
       family: "Family",
       business: "Business",
       wedding: "Wedding",
       airport_transfer: "Airport Transfer",
       off_road: "Off-Road",
       commercial: "Commercial",
      // Dashboard
      dashboard: "Dashboard",
      welcome: "Welcome back",
      totalCars: "Total Cars",
      active: "Active",
      pending: "Pending",
      quickStats: "Quick Stats",
      recentActivity: "Recent Activity",
      enterCarName: "Enter car make (e.g., Toyota, BMW)...",
      add: "Add",
      notifications: "Notifications",

      // Settings
      settings: "Settings",
      manageAccount: "Manage your account and preferences",
      personalInformation: "Personal Information",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      appSettings: "App Settings",
      darkMode: "Dark Mode",
      enableDarkTheme: "Enable dark theme",
      receiveNotifications: "Receive push notifications",
      paymentMethods: "Payment Methods",
      savedDrafts: "Saved Drafts",
      privacySecurity: "Privacy & Security",
      saveChanges: "Save Changes",
      logout: "Logout",
      loading: "Loading...",
      profileSaved: "Profile saved successfully!",
      premium: "Premium",
      memberSince: "Member since",
      premiumPlanActive: "Premium Plan Active",
      expiresIn: "Expires in 25 days",
      managePlan: "Manage Plan",

      // My Cars Screen
      myCars: "My Cars",
      manageVehicles: "Manage your vehicle listings",
      currency: "FRW",
      perDay: "per day",
      views: "views",
      available: "Available",
      unavailable: "Unavailable",
      viewDetails: "View Details",
      carDetails: "Car Details",
      edit: "Edit",
      type: "Type",
      transmission: "Transmission",
      fuelType: "Fuel Type",
      seats: "Seats",
      location: "Location",
      rating: "Rating",
      features: "Features",
      description: "Description",

      // Add Car Screen
      addNewCar: "Add New Car",
      editCar: "Edit Car",
      step: "Step",
      of: "of",
      basicInformation: "Basic Information",
      specifications: "Specifications",
      pricingAndPhotos: "Pricing & Photos",
      reviewAndSubmit: "Review & Submit",
      reviewChanges: "Review Changes",
      basicInfo: "Basic Info",
      pricing: "Pricing",
      review: "Review",

      // Form Fields
      make: "Make",
      selectMake: "Select make",
      year: "Year",
      selectYear: "Select year",
      customMake: "Custom Make",
      enterMakeName: "Enter make name",
      selectType: "Select type",
      phoneNumber: "Phone Number",
      ownerType: "Owner Type",
      individual: "Individual",
      company: "Company",
      companyName: "Company Name",
      enterCompanyName: "Enter company name",
      companyPhone: "Company Phone",

      // Specifications
      selectTransmission: "Select transmission",
      selectFuelType: "Select fuel type",
      selectSeats: "Select seats",
      featuresOptional: "Features (Optional)",

      // Features
      airConditioning: "Air Conditioning",
      gpsNavigation: "GPS Navigation",
      bluetooth: "Bluetooth",
      usbCharging: "USB Charging",
      backupCamera: "Backup Camera",
      sunroof: "Sunroof",
      leatherSeats: "Leather Seats",
      heatedSeats: "Heated Seats",
      premiumSound: "Premium Sound",
      keylessEntry: "Keyless Entry",
      cruiseControl: "Cruise Control",
      parkingSensors: "Parking Sensors",
      wifiHotspot: "WiFi Hotspot",
      appleCarPlay: "Apple CarPlay",
      androidAuto: "Android Auto",
      laneAssist: "Lane Assist",

      // Location
      address: "Address",
      selectLocation: "Select location",
      mapWillAppear: "Map will appear here",
      clickToSelect: "Click to select location",
      categories: "Categories",

      // Categories
      economy: "Economy",
      compact: "Compact",
      midSize: "Mid-size",
      fullSize: "Full-size",
      luxury: "Luxury",
      sports: "Sports",
      family: "Family",
      business: "Business",
      wedding: "Wedding",
      airportTransfer: "Airport Transfer",

      // Pricing
      pricingType: "Pricing Type",
      selectPricing: "Select pricing",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      perWeek: "per week",
      perMonth: "per month",
      price: "Price",

      // Photos
      carPhotosRequired: "Car Photos (4 Required)",
      uploadAllPhotos: "Please upload all 4 required photos",
      frontExterior: "Front Exterior",
      sideExterior: "Side Exterior",
      rearExterior: "Rear Exterior",
      interior: "Interior",
      choose: "Choose",
      note: "Note",
      thumbnailNote: "Thumbnail photo will be selected by company before listing goes live.",

      // Review
      reviewChangesBeforeUpdate: "Please review your changes before updating",
      reviewDetailsBeforeSubmit: "Please review your car details before submitting",
      carSummary: "Car Summary",
      car: "Car",
      selected: "selected",
      photos: "Photos",
      uploaded: "uploaded",
      changesWillBeSaved: " Your changes will be saved and the listing will be updated immediately.",
      listingWillBeReviewed:
        " Your listing will be reviewed within 24 hours. You'll receive a notification once it's approved and live.",

      // Navigation
      previous: "Previous",
      next: "Next",
      saveDraft: "Save Draft",
      saveChanges: "Save Changes",
      submitListing: "Submit Listing",

      // Alerts
      requiredFields: "Required Fields",
      fillRequiredFields: "Please fill in all required fields marked with *",
      draftSaved: "Draft Saved",
      carListingSaved: "Your car listing has been saved as a draft.",
      success: "Success!",
      carListingUpdated: "Your car listing has been updated successfully!",
      carListingSubmitted: "Your car listing has been submitted successfully!",
      ok: "OK",

      // Image Picker
      permissionNeeded: "Permission needed",
      grantCameraPermission: "Please grant camera roll permissions to upload photos.",
      selectPhoto: "Select Photo",
      choosePhotoMethod: "Choose how you want to add a photo",
      camera: "Camera",
      gallery: "Gallery",
      cancel: "Cancel",
      error: "Error",
      addressNotFound: "Could not find the address. Please try again.",

      // Time expressions
      minutesAgo: "{{count}} minutes ago",
      hoursAgo: "{{count}} hours ago",
      hoursAgo3: "3 hours ago",
      hoursAgo5: "5 hours ago",
      dayAgo: "1 day ago",
      daysAgo: "{{count}} days ago",
      daysAgo3: "3 days ago",

      // Activities
      auditApproved: "Your Audi Q7 listing was approved",
      bmwViews: "BMW X5 received 12 new views",
      mercedesInquiry: "New inquiry for Mercedes GLE",

      // Notifications
      updateCarAvailability: "Update Car Availability",
      updateCarMessage: "Update availability for your BMW X5",
      updateCarFullMessage:
        "Good morning! It's good practice to regularly update your BMW X5 availability so customers can see when it's available for rent.",

      listingApproved: "Listing Approved",
      approvedMessage: "Your Audi Q7 listing is now live",
      approvedFullMessage:
        "Congratulations! Your Audi Q7 listing has been approved and is now live on RushGo. Customers can now view and book your vehicle.",

      newBooking: "New Booking Request",
      bookingMessage: "Someone wants to book your BMW X5",
      bookingFullMessage:
        "John Doe has requested to book your BMW X5 for 3 days from March 15-17, 2024. The total amount is 150,000 FRW.",

      paymentReceived: "Payment Received",
      paymentMessage: "Payment of 120,000 FRW received",
      paymentFullMessage:
        "You have received a payment of 120,000 FRW for the rental of your Mercedes GLE. The payment has been processed and will be transferred to your account within 2-3 business days.",

      maintenanceReminder: "Maintenance Reminder",
      maintenanceMessage: "BMW X5 maintenance due soon",
      maintenanceFullMessage:
        "Your BMW X5 is due for maintenance. Please ensure your vehicle is properly maintained to provide the best experience for your customers.",

      reviewReceived: "New Review",
      reviewMessage: "You received a 5-star review",
      reviewFullMessage:
        "Sarah Johnson left a 5-star review for your Toyota Camry: 'Excellent car and great service! The car was clean and well-maintained. Highly recommend!'",

      // Navigation
      home: "Home",
    },
  },
  fr: {
    translation: {
      // Dashboard
      dashboard: "Tableau de bord",
      welcome: "Bon retour",
      totalCars: "Total des voitures",
      active: "Actif",
      pending: "En attente",
      quickStats: "Statistiques rapides",
      recentActivity: "Activité récente",
      enterCarName: "Entrez la marque de voiture (ex: Toyota, BMW)...",
      add: "Ajouter",
      notifications: "Notifications",

      // Settings
      settings: "Paramètres",
      manageAccount: "Gérez votre compte et vos préférences",
      personalInformation: "Informations personnelles",
      fullName: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      appSettings: "Paramètres de l'application",
      darkMode: "Mode sombre",
      enableDarkTheme: "Activer le thème sombre",
      receiveNotifications: "Recevoir les notifications push",
      paymentMethods: "Méthodes de paiement",
      savedDrafts: "Brouillons sauvegardés",
      privacySecurity: "Confidentialité et sécurité",
      saveChanges: "Sauvegarder les modifications",
      logout: "Se déconnecter",
      loading: "Chargement...",
      profileSaved: "Profil sauvegardé avec succès!",
      premium: "Premium",
      memberSince: "Membre depuis",
      premiumPlanActive: "Plan Premium actif",
      expiresIn: "Expire dans 25 jours",
      managePlan: "Gérer le plan",

      // My Cars Screen
      myCars: "Mes Voitures",
      manageVehicles: "Gérer vos annonces de véhicules",
      currency: "FRW",
      perDay: "par jour",
      views: "vues",
      available: "Disponible",
      unavailable: "Indisponible",
      viewDetails: "Voir les détails",
      carDetails: "Détails de la voiture",
      edit: "Modifier",
      type: "Type",
      transmission: "Transmission",
      fuelType: "Type de carburant",
      seats: "Sièges",
      location: "Emplacement",
      rating: "Évaluation",
      features: "Caractéristiques",
      description: "Description",

      // Add Car Screen
      addNewCar: "Ajouter une nouvelle voiture",
      editCar: "Modifier la voiture",
      step: "Étape",
      of: "de",
      basicInformation: "Informations de base",
      specifications: "Spécifications",
      pricingAndPhotos: "Prix et photos",
      reviewAndSubmit: "Réviser et soumettre",
      reviewChanges: "Réviser les modifications",
      basicInfo: "Info de base",
      pricing: "Prix",
      review: "Révision",

      // Form Fields
      make: "Marque",
      selectMake: "Sélectionner la marque",
      year: "Année",
      selectYear: "Sélectionner l'année",
      customMake: "Marque personnalisée",
      enterMakeName: "Entrer le nom de la marque",
      selectType: "Sélectionner le type",
      phoneNumber: "Numéro de téléphone",
      ownerType: "Type de propriétaire",
      individual: "Individuel",
      company: "Entreprise",
      companyName: "Nom de l'entreprise",
      enterCompanyName: "Entrer le nom de l'entreprise",
      companyPhone: "Téléphone de l'entreprise",

      // Specifications
      selectTransmission: "Sélectionner la transmission",
      selectFuelType: "Sélectionner le type de carburant",
      selectSeats: "Sélectionner les sièges",
      featuresOptional: "Caractéristiques (Optionnel)",

      // Features
      airConditioning: "Climatisation",
      gpsNavigation: "Navigation GPS",
      bluetooth: "Bluetooth",
      usbCharging: "Chargement USB",
      backupCamera: "Caméra de recul",
      sunroof: "Toit ouvrant",
      leatherSeats: "Sièges en cuir",
      heatedSeats: "Sièges chauffants",
      premiumSound: "Son premium",
      keylessEntry: "Entrée sans clé",
      cruiseControl: "Régulateur de vitesse",
      parkingSensors: "Capteurs de stationnement",
      wifiHotspot: "Point d'accès WiFi",
      appleCarPlay: "Apple CarPlay",
      androidAuto: "Android Auto",
      laneAssist: "Assistance de voie",

      // Location
      address: "Adresse",
      selectLocation: "Sélectionner l'emplacement",
      mapWillAppear: "La carte apparaîtra ici",
      clickToSelect: "Cliquer pour sélectionner l'emplacement",
      categories: "Catégories",

      // Categories
      economy: "Économique",
      compact: "Compact",
      midSize: "Taille moyenne",
      fullSize: "Grande taille",
      luxury: "Luxe",
      sports: "Sport",
      family: "Familiale",
      business: "Affaires",
      wedding: "Mariage",
      airportTransfer: "Transfert aéroport",

      // Pricing
      pricingType: "Type de tarification",
      selectPricing: "Sélectionner la tarification",
      daily: "Quotidien",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      perWeek: "par semaine",
      perMonth: "par mois",
      price: "Prix",

      // Photos
      carPhotosRequired: "Photos de voiture (4 requises)",
      uploadAllPhotos: "Veuillez télécharger les 4 photos requises",
      frontExterior: "Extérieur avant",
      sideExterior: "Extérieur latéral",
      rearExterior: "Extérieur arrière",
      interior: "Intérieur",
      choose: "Choisir",
      note: "Note",
      thumbnailNote: "La photo miniature sera sélectionnée par l'entreprise avant la mise en ligne de l'annonce.",

      // Review
      reviewChangesBeforeUpdate: "Veuillez réviser vos modifications avant la mise à jour",
      reviewDetailsBeforeSubmit: "Veuillez réviser les détails de votre voiture avant de soumettre",
      carSummary: "Résumé de la voiture",
      car: "Voiture",
      selected: "sélectionné",
      photos: "Photos",
      uploaded: "téléchargé",
      changesWillBeSaved: " Vos modifications seront sauvegardées et l'annonce sera mise à jour immédiatement.",
      listingWillBeReviewed:
        " Votre annonce sera révisée dans les 24 heures. Vous recevrez une notification une fois qu'elle sera approuvée et en ligne.",

      // Navigation
      previous: "Précédent",
      next: "Suivant",
      saveDraft: "Sauvegarder le brouillon",
      saveChanges: "Sauvegarder les modifications",
      submitListing: "Soumettre l'annonce",

      // Alerts
      requiredFields: "Champs requis",
      fillRequiredFields: "Veuillez remplir tous les champs requis marqués d'un *",
      draftSaved: "Brouillon sauvegardé",
      carListingSaved: "Votre annonce de voiture a été sauvegardée comme brouillon.",
      success: "Succès!",
      carListingUpdated: "Votre annonce de voiture a été mise à jour avec succès!",
      carListingSubmitted: "Votre annonce de voiture a été soumise avec succès!",
      ok: "OK",

      // Image Picker
      permissionNeeded: "Permission nécessaire",
      grantCameraPermission: "Veuillez accorder les permissions de la galerie photo pour télécharger des photos.",
      selectPhoto: "Sélectionner une photo",
      choosePhotoMethod: "Choisissez comment vous voulez ajouter une photo",
      camera: "Caméra",
      gallery: "Galerie",
      cancel: "Annuler",
      error: "Erreur",
      addressNotFound: "Impossible de trouver l'adresse. Veuillez réessayer.",

      // Time expressions
      minutesAgo: "il y a {{count}} minutes",
      hoursAgo: "il y a {{count}} heures",
      hoursAgo3: "il y a 3 heures",
      hoursAgo5: "il y a 5 heures",
      dayAgo: "il y a 1 jour",
      daysAgo: "il y a {{count}} jours",
      daysAgo3: "il y a 3 jours",

      // Activities
      auditApproved: "Votre annonce Audi Q7 a été approuvée",
      bmwViews: "BMW X5 a reçu 12 nouvelles vues",
      mercedesInquiry: "Nouvelle demande pour Mercedes GLE",

      // Notifications
      updateCarAvailability: "Mettre à jour la disponibilité",
      updateCarMessage: "Mettre à jour la disponibilité de votre BMW X5",
      updateCarFullMessage:
        "Bonjour! Il est recommandé de mettre à jour régulièrement la disponibilité de votre BMW X5 pour que les clients puissent voir quand elle est disponible à la location.",

      listingApproved: "Annonce approuvée",
      approvedMessage: "Votre annonce Audi Q7 est maintenant en ligne",
      approvedFullMessage:
        "Félicitations! Votre annonce Audi Q7 a été approuvée et est maintenant en ligne sur RushGo. Les clients peuvent maintenant voir et réserver votre véhicule.",

      newBooking: "Nouvelle demande de réservation",
      bookingMessage: "Quelqu'un veut réserver votre BMW X5",
      bookingFullMessage:
        "Jean Dupont a demandé à réserver votre BMW X5 pour 3 jours du 15 au 17 mars 2024. Le montant total est de 150 000 FRW.",

      paymentReceived: "Paiement reçu",
      paymentMessage: "Paiement de 120 000 FRW reçu",
      paymentFullMessage:
        "Vous avez reçu un paiement de 120 000 FRW pour la location de votre Mercedes GLE. Le paiement a été traité et sera transféré sur votre compte dans 2-3 jours ouvrables.",

      maintenanceReminder: "Rappel de maintenance",
      maintenanceMessage: "Maintenance BMW X5 bientôt due",
      maintenanceFullMessage:
        "Votre BMW X5 nécessite une maintenance. Veuillez vous assurer que votre véhicule est correctement entretenu pour offrir la meilleure expérience à vos clients.",

      reviewReceived: "Nouvel avis",
      reviewMessage: "Vous avez reçu un avis 5 étoiles",
      reviewFullMessage:
        "Marie Martin a laissé un avis 5 étoiles pour votre Toyota Camry: 'Excellente voiture et excellent service! La voiture était propre et bien entretenue. Je recommande vivement!'",

      // Navigation
      home: "Accueil",
      // Navigation
      next: "Suivant",
      previous: "Précédent",
      submit: "Soumettre l'Annonce",
      save_changes: "Sauvegarder les Modifications",
      save_draft: "Sauvegarder le Brouillon",

      // Steps
      step_vehicle: "Véhicule",
      step_owner: "Propriétaire",
      step_location: "Localisation",
      step_pricing: "Tarification",
      step_media: "Médias",
      step_review: "Révision",

      // Headers
      add_new_car: "Ajouter une Nouvelle Voiture",
      edit_car: "Modifier la Voiture",
      step_of: "Étape {{current}} sur {{total}}",

      // Vehicle Information
      vehicle_information: "Informations du Véhicule",
      make_required: "Marque *",
      model_required: "Modèle *",
      year_required: "Année *",
      type_required: "Type *",
      transmission_required: "Transmission *",
      fuel_type_required: "Type de Carburant *",
      seating_capacity_required: "Capacité d'Assise *",
      features_optional: "Caractéristiques (Optionnel)",

      // Owner Information
      owner_information: "Informations du Propriétaire",
      owner_type: "Type de Propriétaire",
      individual: "Individuel",
      company: "Entreprise",
      full_name_required: "Nom Complet *",
      company_name_required: "Nom de l'Entreprise *",
      phone_number_required: "Numéro de Téléphone *",

      // Location
      location_details: "Détails de Localisation",
      province_required: "Province *",
      address_required: "Adresse *",
      country: "Pays",
      location_on_map_required: "Localisation sur la Carte *",

      // Pricing
      pricing_category: "Tarification et Catégorie",
      category_required: "Catégorie *",
      base_price_required: "Prix de Base par Jour (FRW) *",
      weekly_discount: "Remise Hebdomadaire (%)",
      monthly_discount: "Remise Mensuelle (%)",

      // Media
      upload_photos: "Télécharger des Photos",
      car_photos_required: "Photos de Voiture (4 Requises) *",
      interior_view: "Vue Intérieure",
      front_exterior: "Extérieur Avant",
      side_exterior: "Extérieur Latéral",
      rear_exterior: "Extérieur Arrière",
      business_thumbnail: "Miniature d'Entreprise (Fonctionnalité Premium)",
      choose: "Choisir",
      upload_premium: "Télécharger Premium",

      // Review
      review_submit: "Réviser et Soumettre",
      review_changes: "Réviser les Modifications",

      // Placeholders
      select_make: "Sélectionner la marque",
      select_model: "Sélectionner le modèle",
      select_type: "Sélectionner le type",
      select_transmission: "Sélectionner la transmission",
      select_fuel_type: "Sélectionner le type de carburant",
      select_seating_capacity: "Sélectionner la capacité d'assise",
      select_category: "Sélectionner la catégorie",
      select_province: "Sélectionner la province",
      enter_address: "Entrer l'adresse",
      tap_to_select_location: "Appuyer pour sélectionner l'emplacement",

      // Features
      air_conditioning: "Climatisation",
      gps_navigation: "Navigation GPS",
      bluetooth: "Bluetooth",
      usb_charging: "Chargement USB",
      backup_camera: "Caméra de Recul",
      sunroof: "Toit Ouvrant",
      leather_seats: "Sièges en Cuir",
      heated_seats: "Sièges Chauffants",
      premium_sound: "Son Premium",
      keyless_entry: "Entrée sans Clé",
      cruise_control: "Régulateur de Vitesse",
      parking_sensors: "Capteurs de Stationnement",
      wifi_hotspot: "Point d'Accès WiFi",
      apple_carplay: "Apple CarPlay",
      android_auto: "Android Auto",
      lane_assist: "Assistance de Voie",
      automatic_emergency_braking: "Freinage d'Urgence Automatique",
      blind_spot_monitoring: "Surveillance d'Angle Mort",
      adaptive_cruise_control: "Régulateur de Vitesse Adaptatif",
      "360_camera": "Caméra 360°",
      wireless_charging: "Chargement sans Fil",
      ventilated_seats: "Sièges Ventilés",
      memory_seats: "Sièges à Mémoire",
      panoramic_roof: "Toit Panoramique",
      head_up_display: "Affichage Tête Haute",
      night_vision: "Vision Nocturne",
      massage_seats: "Sièges Massants",
      ambient_lighting: "Éclairage d'Ambiance",

      // Validation
      required_fields: "Champs Requis",
      fill_required_fields: "Veuillez remplir tous les champs requis correctement",
      invalid_name: "Veuillez entrer un nom valide (lettres, espaces, traits d'union, apostrophes uniquement)",
      invalid_phone: "Veuillez entrer exactement 10 chiffres",
      select_location_map: "Veuillez sélectionner l'emplacement sur la carte",
      upload_all_photos: "Veuillez télécharger les 4 photos requises",

      // Payment
      premium_thumbnail_upload: "Téléchargement de Miniature Premium",
      amount: "Montant: 5,000 FRW",
      choose_payment_method: "Choisir la Méthode de Paiement:",
      mtn_momo: "MTN MOMO",
      credit_card: "Carte de Crédit",
      phone_number: "Numéro de Téléphone",
      card_number: "Numéro de Carte",
      cardholder_name: "Nom du Porteur de Carte",
      expiry_date: "Date d'Expiration",
      cvv: "CVV",
      confirm_payment: "Confirmer le Paiement",

      // Success Messages
      success: "Succès!",
      listing_submitted: "Votre annonce de voiture a été soumise avec succès!",
      listing_updated: "Votre annonce de voiture a été mise à jour avec succès!",
      payment_successful: "Paiement Réussi!",
      payment_processed:
        "Votre paiement de 5,000 FRW a été traité avec succès. Vous pouvez maintenant télécharger votre miniature premium.",

      // Car Types
      sedan: "Berline",
      suv: "SUV",
      hatchback: "Hayon",
      coupe: "Coupé",
      convertible: "Cabriolet",
      pickup: "Pick-up",
      van: "Fourgonnette",
      minibus: "Minibus",
      crossover: "Crossover",
      station_wagon: "Break",
      truck: "Camion",
      limousine: "Limousine",
      sports_car: "Voiture de Sport",
      other: "Autre",

      // Transmission
      automatic: "Automatique",
      manual: "Manuelle",
      cvt: "CVT",
      semi_automatic: "Semi-Automatique",

      // Fuel Types
      gasoline: "Essence",
      diesel: "Diesel",
      hybrid: "Hybride",
      electric: "Électrique",
      cng: "GNC",
      lpg: "GPL",

      // Categories
      economy: "Économique",
      compact: "Compacte",
      mid_size: "Taille Moyenne",
      full_size: "Grande Taille",
      premium: "Premium",
      luxury: "Luxe",
      sports: "Sport",
      family: "Familiale",
      business: "Affaires",
      wedding: "Mariage",
      airport_transfer: "Transfert Aéroport",
      off_road: "Tout-Terrain",
      commercial: "Commercial",
    },

  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: "rw", // Default to Kinyarwanda
  fallbackLng: "rw",
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
