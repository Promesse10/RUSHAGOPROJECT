import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const faqCategories = [
  { id: 'general', name: 'General' },
];

const faqItems = [
  {
    id: 1,
    question: 'What is MUVCAR?',
    answer: 'MUVCAR is a platform that connects car owners with people who want to rent cars. We provide an app where car owners can list their vehicles and renters can browse and contact owners directly to arrange car rentals.',
    category: 'general',
    likes: 56,
    comments: 120,
  },
  {
    id: 2,
    question: 'How do I get in contact with MUVCAR support?',
    answer: 'You can contact MUVCAR support through our email at support@MUVCAR.com or by phone at +250780114522.',
    category: 'general',
    likes: 23,
    comments: 14,
  },
  {
    id: 3,
    question: 'Do you offer discounts?',
    answer: 'MUVCAR itself doesn’t offer discounts, but car owners can set their own prices and may offer discounts directly to renters during their negotiations through the app’s contact feature.',
    category: 'general',
    likes: 0,
    comments: 100,
  },
  {
    id: 4,
    question: 'Is MUVCAR hiring?',
    answer: 'MUVCAR is always looking for talented individuals to join our team. Check our careers page at MUVCAR.com/careers for current openings.',
    category: 'general',
    likes: 23,
    comments: 14,
  },
  {
    id: 5,
    question: 'How do I list my car on MUVCAR?',
    answer: 'To list your car, create an account as a car owner, verify your identity, add your car details including photos, set your pricing and availability, and publish your listing. Renters can then contact you through the app to arrange a rental.',
    category: 'general',
    likes: 45,
    comments: 32,
  },
  {
    id: 6,
    question: 'How do I rent a car on MUVCAR?',
    answer: 'To rent a car, create an account as a renter, verify your identity, browse available cars in your area, select a car you like, and click the contact button to reach the car owner via call through the app to negotiate and finalize the rental deal.',
    category: 'general',
    likes: 67,
    comments: 41,
  },
  {
    id: 7,
    question: 'How do car owners and renters connect?',
    answer: 'Through the MUVCAR app, renters can choose a car they wish to rent and click the contact button, which initiates a call to the car owner. Both parties can then discuss and agree on the rental terms directly.',
    category: 'general',
    likes: 38,
    comments: 27,
  },
];

const GetHelp = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const navigateBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const toggleFaq = (id) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };

  const filteredFaqs = faqItems.filter(item => 
    item.category === selectedCategory &&
    (searchQuery === '' || 
     item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>How can we help you today?</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search question"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Feather name="search" size={24} color="#FFF" />
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {faqCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.faqList}>
            {filteredFaqs.map(faq => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color="#333"
                    style={[
                      styles.chevron,
                      expandedFaq === faq.id && styles.chevronExpanded,
                    ]}
                  />
                </TouchableOpacity>
                
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                    
                    <View style={styles.faqFooter}>
                      <View style={styles.faqStat}>
                        <Feather name="thumbs-up" size={16} color="#999" />
                        <Text style={styles.faqStatText}>{faq.likes}</Text>
                      </View>
                      <View style={styles.faqStat}>
                        <Feather name="message-circle" size={16} color="#999" />
                        <Text style={styles.faqStatText}>{faq.comments}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
            
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007EFD',
  },
  container: {
    flex: 1,
    backgroundColor: '#007EFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  categoriesScroll: {
    maxHeight: 60,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: '#121628',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  faqList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  faqItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    marginLeft: 10,
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  faqFooter: {
    flexDirection: 'row',
    marginTop: 15,
  },
  faqStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  faqStatText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  bottomPadding: {
    height: 50,
  },
});

export default GetHelp;