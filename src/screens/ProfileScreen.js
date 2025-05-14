import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';
import { AppContext } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import { getProfileInfo } from '../services/authServices';

const ProfileScreen = () => {
  // Profile data
  const profile = {
    id: 52,
    name: "ABCD",
    email_id: "xyz@gmail.com",
    mobile_number: "1234567890",
    gstn_number: "",
    contact_name: "XYZ",
    address_line_1: "aaaa",
    address_line_2: "bbb",
    is_supplier: false,
    image: "https://my-office-docs.s3.amazonaws.com/media/default_customer.jpg",
    customer_type: "R",
    customer_group: "Industry Type",
    outstanding_amt: 0,
    no_of_task: 1,
    no_of_pi: 0
  };
  const { logout } = useContext(AppContext);
  const [userPin, setUserPin] = useState(null);
    const [profileImg, setProfileImg] = useState({});
  const router = useRouter();
    const navigation = useNavigation();

      useEffect(() => {
        const fetchUserPin = async () => {
            const storedPin = await AsyncStorage.getItem('userPin');
            setUserPin(storedPin); // storedPin will be `null` if no value is found
        };
        fetchUserPin();
    }, []);

  const handlePressPassword = () => {
    router.push({ pathname: 'ResetPassword' });
  };

  const handlePressFAQ = () => {
    console.log("Press FAQ button");
  };

  const handlePressMessage = () => {
    console.log("Press Message button");
  };

    const handleBack = () => {
    navigation.goBack();
  };
  

    useEffect(() => {
    getProfileInfo().then((res) => {
      // console.log("datata", res.data);
      
      setProfileImg(res.data);
      setIsManager(res.data.user_group.is_manager);
    });
  }, []);

  // Format address based on available lines
  const formatAddress = () => {
    if (profile.address_line_1 && profile.address_line_2) {
      return `${profile.address_line_1}, ${profile.address_line_2}`;
    } else if (profile.address_line_1) {
      return profile.address_line_1;
    } else if (profile.address_line_2) {
      return profile.address_line_2;
    }
    return "No address available";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor={colors.primary} /> */}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          {/* <MaterialIcons name="edit" size={24} color={colors.white} /> */}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Banner */}
        <View style={styles.profileBanner}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileImg?.image }}
              style={styles.profileImage}
              // defaultSource={require('expo-asset:/placeholder.png')}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.badgeContainer}>
            {/* <View style={styles.badge}>
              <Text style={styles.badgeText}>Tasks: {profile.no_of_task}</Text>
            </View> */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{profile.customer_group}</Text>
            </View>
          </View>
        </View>
        
        {/* Contact Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="email" size={22} color={colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{profile.email_id}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="phone" size={22} color={colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{profile.mobile_number}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="location-on" size={22} color={colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{formatAddress()}</Text>
              </View>
            </View>
            
            {profile.contact_name && (
              <>
                <View style={styles.divider} />
                <View style={styles.contactItem}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="person" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactLabel}>Contact Person</Text>
                    <Text style={styles.contactValue}>{profile.contact_name}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Account Options */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Options</Text>
          
          <View style={styles.optionsContainer}>
            {/* Set Pin */}
            <TouchableOpacity style={styles.optionItem} onPress={handlePressPassword}>
              <View style={styles.optionIconContainer}>
                <MaterialIcons name="lock" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Update PIN</Text>
                <Text style={styles.optionDescription}>Set or change your security PIN</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.optionDivider} />
            
            {/* FAQ */}
            {/* <TouchableOpacity style={styles.optionItem} onPress={handlePressFAQ}>
              <View style={styles.optionIconContainer}>
                <MaterialIcons name="help" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>FAQ</Text>
                <Text style={styles.optionDescription}>Frequently asked questions</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity> */}
            
            <View style={styles.optionDivider} />
            
            {/* Logout */}
            <TouchableOpacity style={styles.optionItem} onPress={logout}>
              <View style={[styles.optionIconContainer, { backgroundColor: colors.errorTransparent }]}>
                <MaterialIcons name="logout" size={22} color={colors.error} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionText, { color: colors.error }]}>Logout</Text>
                <Text style={styles.optionDescription}>Sign out from your account</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Contact Button */}
      {/* <TouchableOpacity style={styles.fab} onPress={handlePressMessage}>
        <MaterialIcons name="message" size={24} color={colors.white} />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileBanner: {
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  badge: {
    backgroundColor: colors.primaryTransparent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.muted,
    marginLeft: 64,
  },
  optionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.muted,
    marginLeft: 68,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ProfileScreen;