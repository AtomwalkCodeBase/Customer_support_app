import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Switch, Dimensions, SafeAreaView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';
import { AppContext } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import { getProfileInfo } from '../services/authServices';
import ConfirmationModal from '../components/ConfirmationModal';
import { getCustomerDetailList } from '../services/productServices';
import { Loader } from '../components/Modals';
import Constants from 'expo-constants';
import HeaderComponent from '../components/HeaderComponent';

const { width, height } = Dimensions.get('window');

const scaleWidth = (size) => (width / 375) * size;
const scaleHeight = (size) => (height / 812) * size;


const ProfileScreen = () => {
  const { logout } = useContext(AppContext);
  const [userPin, setUserPin] = useState(null);
  const [profileImg, setProfileImg] = useState({});
  const [profile, setProfile] = useState([]);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isBiometricModalVisible, setIsBiometricModalVisible] = useState(false); // New state for biometric modal
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pendingBiometricValue, setPendingBiometricValue] = useState(null); // Store pending toggle value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ visible: false, message: '' });
  const router = useRouter();
  const navigation = useNavigation();

    const appVersion = Constants.expoConfig?.version || '0.0.1';

  // Fetch customer details
  const fetchCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = await AsyncStorage.getItem('Customer_id');
      const res = await getCustomerDetailList(customerId);
      // console.log("data of customer", res.data)
      // const customer = res.data?.find(item => item.id?.toString() === customerId?.toString());
      setProfile(Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : {});
    } catch (error) {
      console.log('Failed to fetch Customer Details:', error.message);
      setError({ visible: true, message: 'Failed to load Customer Details' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user pin and biometric setting from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedPin = await AsyncStorage.getItem('userPin');
        setUserPin(storedPin);

        const biometric = await AsyncStorage.getItem('userBiometric');
        setBiometricEnabled(biometric === 'true');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    fetchUserData();
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // Fetch profile image
  useEffect(() => {
    getProfileInfo().then((res) => {
      setProfileImg(res.data);
    });
  }, []);

  const handlePressPassword = () => {
    router.push({ pathname: 'ResetPassword' });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Handle biometric toggle change
  const handleBiometricToggle = (value) => {
    setPendingBiometricValue(value); // Store the intended toggle value
    setIsBiometricModalVisible(true); // Show confirmation modal
  };

  // Confirm biometric toggle
  const confirmBiometricToggle = async () => {
    try {
      setBiometricEnabled(pendingBiometricValue);
      if (pendingBiometricValue) {
        await AsyncStorage.setItem('userBiometric', 'true');
      } else {
        await AsyncStorage.removeItem('userBiometric');
      }
    } catch (error) {
      console.error('Error updating biometric setting:', error);
      setBiometricEnabled(!pendingBiometricValue); // Revert on error
      setError({ visible: true, message: 'Failed to update biometric setting' });
    } finally {
      setIsBiometricModalVisible(false);
      setPendingBiometricValue(null);
    }
  };

  // Cancel biometric toggle
  const cancelBiometricToggle = () => {
    setIsBiometricModalVisible(false);
    setPendingBiometricValue(null);
  };

  // Format address
  const formatAddress = () => {
    if (profile.address_line_1 && profile.address_line_2) {
      return `${profile.address_line_1}, ${profile.address_line_2}`;
    } else if (profile.address_line_1) {
      return profile.address_line_1;
    } else if (profile.address_line_2) {
      return profile.address_line_2;
    }
    return 'No address available';
  };

  if (loading) {
    return <Loader visible={loading} message={'Please Wait....'} />;
  }

  if (error.visible) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.error, margin: 20 }}>{error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        headerTitle="profile" 
        onBackPress={handleBack} 
        // onBackPress={() => router.back()} 
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileBanner}>
          <View >
            <View style={styles.profileImageContainer}></View>
              <Image source={{ uri: profile?.image }} style={styles.profileImage} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}></View>
              <Text style={styles.profileName}>
                {profile?.name}
              </Text>
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Tasks: {profile.no_of_task}</Text>
                </View>
              </View>
            {/* </View> */}
            <TouchableOpacity
              onPress={() => setIsLogoutModalVisible(true)}
              accessibilityLabel="Logout"
              style={styles.topLogoutButton}
            >
              <MaterialIcons name="logout" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        {/* </View> */}

        {/*  Contact Information */}
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
            {/* Biometric Authentication */}
            <View style={styles.optionItem}>
              <View style={styles.optionIconContainer}>
                <MaterialIcons name="fingerprint" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Biometric Authentication</Text>
                <Text style={styles.optionDescription}>
                  Use fingerprint or face ID to log in
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.muted, true: colors.primaryTransparent }}
                thumbColor={biometricEnabled ? colors.primary : colors.white}
              />
            </View>
            <View style={styles.optionDivider} />
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
            {/* Logout */}
            <TouchableOpacity style={styles.optionItem} onPress={() => setIsLogoutModalVisible(true)}>
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
            <View style={styles.fixedFooter}>
              <Text>Version Code: {appVersion}</Text>
            </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={isLogoutModalVisible}
        message="Are you sure you want to logout?"
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          logout();
        }}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Logout"
        cancelText="Cancel"
      />

      {/* Biometric Confirmation Modal */}
      <ConfirmationModal
        visible={isBiometricModalVisible}
        message={`Are you sure you want to ${
          pendingBiometricValue ? 'enable' : 'disable'
        } biometric authentication?`}
        onConfirm={confirmBiometricToggle}
        onCancel={cancelBiometricToggle}
        confirmText={pendingBiometricValue ? 'Enable' : 'Disable'}
        cancelText="Cancel"
      />
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
  topLogoutButton:{
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: colors.primaryTransparent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: scaleHeight(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    width: '100%',
  },
  footerText: {
    color: colors.black,
    fontSize: scaleWidth(14),
    fontWeight: '500',
  }
});

export default ProfileScreen;