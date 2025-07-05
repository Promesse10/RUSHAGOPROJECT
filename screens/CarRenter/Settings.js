import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
} from "react-native";
import { ChevronLeft, User, Link, Globe, Bell, Info, HelpCircle, Lock, LogOut } from "react-native-feather";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const navigation = useNavigation();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const role = await AsyncStorage.getItem("userRole");
      const mode = await AsyncStorage.getItem("isOwnerMode");
      if (role) setUserRole(role);
      if (mode) setIsOwnerMode(mode === "true");
    };
    loadUserData();
  }, []);

  const handleModeToggle = async (value) => {
    setIsOwnerMode(value);
    await AsyncStorage.setItem("isOwnerMode", value.toString());
    if (value) {
      navigation.navigate("Dashboard"); // Car Owner mode
    } else {
      navigation.navigate("Home"); // Car Renter mode
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "AuthScreen" }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack}>
            <ChevronLeft width={24} height={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Settings */}
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("AccountInformation")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <User width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>Account information</Text>
            </View>
            <ChevronLeft
              width={20}
              height={20}
              color="#999"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("LinkAccount")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Link width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>Link Account</Text>
            </View>
            <ChevronLeft
              width={20}
              height={20}
              color="#999"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          {userRole === "both" && (
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <User width={20} height={20} color="#007EFD" />
                </View>
                <Text style={styles.settingText}>Switch to Owner Mode</Text>
              </View>
              <Switch
                value={isOwnerMode}
                onValueChange={handleModeToggle}
                trackColor={{ false: "#E0E0E0", true: "#007EFD" }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          {/* App Settings */}
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("Language")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Globe width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>Language</Text>
            </View>
            <ChevronLeft
              width={20}
              height={20}
              color="#999"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Bell width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>Push notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => {
                setPushNotifications(value);
                if (value) {
                  navigateTo("PushNotifications");
                }
              }}
              trackColor={{ false: "#E0E0E0", true: "#007EFD" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Support */}
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("AboutRushGo")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Info width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>About RushGo</Text>
            </View>
            <ChevronLeft
              width={20}
              height={20}
              color="#999"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("PrivacyPolicy")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <HelpCircle width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>Get help</Text>
            </View>
            <ChevronLeft
              width={20}
              height={20}
              color="#999"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("GetHelp")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Lock width={20} height={20} color="#007EFD" />
              </View>
              <Text style={styles.settingText}>Privacy policy</Text>
            </View>
            <ChevronLeft
              width={20}
              height={20}
              color="#999"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, styles.logoutIcon]}>
                <LogOut width={20} height={20} color="#FF3B30" />
              </View>
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 25,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    paddingVertical: 15,
    marginTop: 20,
  },
  logoutIcon: {
    backgroundColor: "#FFEEEE",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
});

export default Settings;