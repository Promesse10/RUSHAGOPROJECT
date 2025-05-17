import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import StatsCard from '../components/StatsCard';
import ActivityLog from '../components/ActivityLog';

const Dashboard = ({ navigation }) => {
  // Mock data
  const stats = [
    { title: 'Total Cars', count: 5, icon: 'directions-car' },
    { title: 'Active', count: 3, icon: 'check-circle' },
    { title: 'Pending', count: 2, icon: 'pending' },
  ];

  const activities = [
    { id: 1, type: 'approval', message: 'Your Audi Q7 listing was approved', time: '2 hours ago' },
    { id: 2, type: 'view', message: 'BMW X5 received 12 new views', time: '5 hours ago' },
    { id: 3, type: 'inquiry', message: 'New inquiry for Mercedes GLE', time: '1 day ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Subscription Status Banner */}
        <View style={styles.subscriptionBanner}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTitle}>Premium Plan</Text>
            <Text style={styles.subscriptionExpiry}>Expires in 25 days</Text>
          </View>
          <TouchableOpacity style={styles.renewButton}>
            <Text style={styles.renewButtonText}>Renew</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <StatsCard 
              key={index}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
            />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.map((activity) => (
            <ActivityLog 
              key={activity.id}
              type={activity.type}
              message={activity.message}
              time={activity.time}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AddNewCar')}
          >
            <Ionicons name="add-circle" size={24} color="#007EFD" />
            <Text style={styles.quickActionText}>Add New Car</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TopChoiceAds')}
          >
            <Ionicons name="star" size={24} color="#007EFD" />
            <Text style={styles.quickActionText}>Promote Car</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  subscriptionBanner: {
    backgroundColor: '#007EFD',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionExpiry: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  renewButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewButtonText: {
    color: '#007EFD',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: '#333333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  activitySection: {
    marginTop: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    color: '#333333',
    fontWeight: '500',
  },
});

export default Dashboard;
