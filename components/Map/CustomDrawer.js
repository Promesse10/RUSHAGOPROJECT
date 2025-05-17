"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from "react-native"
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"
import { MaterialIcons } from "@expo/vector-icons"

const CustomDrawer = (props) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png",
              }}
              style={styles.userImage}
            />
            <View>
              <Text style={styles.userName}>John Smith</Text>
              <Text style={styles.userEmail}>john.smith@example.com</Text>
            </View>
          </View>
        </View>

        <View style={styles.drawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <View style={styles.themeToggle}>
          <MaterialIcons name={isDarkMode ? "dark-mode" : "light-mode"} size={20} color="#666666" />
          <Text style={styles.themeText}>Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: "#D1D1D6", true: "#007EFD" }} />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  drawerItems: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  themeText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#FF3B30",
  },
})

export default CustomDrawer

