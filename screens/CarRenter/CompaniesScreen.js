import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { ChevronLeft, Search, MapPin, Phone } from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// Updated company data with rental companies instead of car brands
const companyData = [
  {
    id: 1,
    name: "Rushago Car Rentals",
    type: "company",
    location: "Kigali City Center, Rwanda",
    phone: "0780114522",
    photo: require("../../assets/company-logo.png"),
    carCount: 5
  },
  {
    id: 2,
    name: "Jean-Claude Mutabazi",
    type: "private",
    location: "Nyamirambo, Kigali, Rwanda",
    phone: "0788223344",
    photo: require("../../assets/profile-photo-1.png"),
    carCount: 2
  },
  {
    id: 3,
    name: "Keza Motors Ltd",
    type: "company",
    location: "Remera, Kigali, Rwanda",
    phone: "0733445566",
    photo: require("../../assets/company-logo-2.png"),
    carCount: 4
  },
  {
    id: 4,
    name: "Marie-Claire Uwimana",
    type: "private",
    location: "Musanze, Rwanda",
    phone: "0799887766",
    photo: require("../../assets/profile-photo-2.png"),
    carCount: 3
  },
  {
    id: 5,
    name: "Rwanda Premium Cars",
    type: "company",
    location: "Nyarutarama, Kigali, Rwanda",
    phone: "0722334455",
    photo: require("../../assets/logo.png"),
    carCount: 5
  }
];

const CompaniesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const [filteredCompanies, setFilteredCompanies] = useState(companyData);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(false); // Default to list view for better readability

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter companies based on search query
    if (searchQuery) {
      const filtered = companyData.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companyData);
    }
  }, [searchQuery]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSelectCompany = (company) => {
    if (route.params?.onSelectCompany) {
      route.params.onSelectCompany(company.name);
    } else {
      navigation.navigate('Bookings', { selectedCompany: company.name });
    }
  };

  const renderCompanyCards = () => {
    if (isLoading) {
      // Skeleton loading for company cards
      return Array(4).fill(0).map((_, index) => (
        <View 
          key={`company-skeleton-${index}`} 
          style={[
            styles.companyCard, 
            !isGridView && styles.companyCardList,
            styles.companyCardSkeleton
          ]}
        >
          <View style={styles.companyLogoSkeleton} />
          <View style={styles.companyInfoSkeleton}>
            <View style={styles.companyNameSkeleton} />
            <View style={styles.companyLocationSkeleton} />
            <View style={styles.companyCountSkeleton} />
          </View>
        </View>
      ));
    }
    
    if (filteredCompanies.length === 0) {
      return (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>{t("noCompaniesFound", "No companies found")}</Text>
        </View>
      );
    }
    
    return filteredCompanies.map((company) => (
      <TouchableOpacity
        key={`company-${company.id}`}
        style={[
          styles.companyCard,
          !isGridView && styles.companyCardList
        ]}
        onPress={() => handleSelectCompany(company)}
      >
        <Image 
          source={company.photo} 
          style={[
            styles.companyLogo,
            !isGridView && styles.companyLogoList
          ]}
          resizeMode="contain"
        />
        <View style={[
          styles.companyInfo,
          !isGridView && styles.companyInfoList
        ]}>
          <Text style={styles.companyCardName}>{company.name}</Text>
          <View style={styles.companyDetail}>
            <MapPin width={14} height={14} color="#666" style={styles.detailIcon} />
            <Text style={styles.companyLocation}>{company.location}</Text>
          </View>
          <View style={styles.companyDetail}>
            <Phone width={14} height={14} color="#666" style={styles.detailIcon} />
            <Text style={styles.companyPhone}>{company.phone}</Text>
          </View>
          <View style={styles.companyFooter}>
            <View style={styles.companyTypeContainer}>
              <Text style={[
                styles.companyType,
                company.type === 'company' ? styles.companyTypeCompany : styles.companyTypePrivate
              ]}>
                {company.type === 'company' ? t("companyType.company", "Company") : t("companyType.private", "Private")}
              </Text>
            </View>
            <Text style={styles.companyCarCount}>
              {company.carCount} {company.carCount === 1 
                ? t("carCount.singular", "car") 
                : t("carCount.plural", "cars")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft width={24} height={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t("companies", "Companies")}
            </Text>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("searchForCompany", "Search company")}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Search width={20} height={20} color="#999" style={styles.searchIcon} />
          </View>
        </View>

        {/* Content (Companies) */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={isGridView ? styles.companiesGrid : styles.companiesList}>
            {renderCompanyCards()}
          </View>
          
          {/* Add padding at the bottom for scrolling past the bottom nav */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    width: 150,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  searchIcon: {
    marginLeft: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Company grid/list styles
  companiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  companiesList: {
    flexDirection: 'column',
  },
  companyCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  companyCardList: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 15,
  },
  companyLogo: {
    width: 70,
    height: 70,
    marginBottom: 10,
    borderRadius: 35,
  },
  companyLogoList: {
    marginBottom: 0,
    marginRight: 15,
  },
  companyInfo: {
    alignItems: 'center',
    width: '100%',
  },
  companyInfoList: {
    alignItems: 'flex-start',
    flex: 1,
  },
  companyCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailIcon: {
    marginRight: 5,
  },
  companyLocation: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  companyPhone: {
    fontSize: 13,
    color: '#666',
  },
  companyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
  },
  companyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyType: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  companyTypeCompany: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  companyTypePrivate: {
    backgroundColor: '#FFF8E1',
    color: '#FFA000',
  },
  companyCarCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007EFD',
  },
  // Company skeleton styles
  companyCardSkeleton: {
    backgroundColor: '#FFFFFF',
  },
  companyLogoSkeleton: {
    width: 70,
    height: 70,
    backgroundColor: '#E0E0E0',
    borderRadius: 35,
    marginBottom: 10,
  },
  companyInfoSkeleton: {
    alignItems: 'center',
    width: '100%',
  },
  companyNameSkeleton: {
    width: 120,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 5,
  },
  companyLocationSkeleton: {
    width: 150,
    height: 13,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 5,
  },
  companyCountSkeleton: {
    width: 60,
    height: 13,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  noResults: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  bottomPadding: {
    height: 80, // Add padding at the bottom for scrolling past the nav bar
  },
});

export default CompaniesScreen;