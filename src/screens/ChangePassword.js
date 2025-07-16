import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Easing, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import HeaderComponent from '../components/HeaderComponent';
import { setUserPinView } from '../services/productServices';
import { colors } from '../Styles/appStyle';
import { ErrorModal, SuccessModal } from '../components/Modals';
import Loader from '../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordScreen = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocusedOld, setIsFocusedOld] = useState(false);
  const [isFocusedNew, setIsFocusedNew] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);
  const [modalState, setModalState] = useState({
  successVisible: false,
  errorVisible: false,
  isLoading: false,
});

  const shakeAnim = new Animated.Value(0); // Animation for shaking error message
  const router = useRouter();

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!oldPin || !newPin || !confirmPin) {
      setErrorMessage('All fields are required.');
      triggerShake();
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMessage('New PIN and Confirm PIN do not match.');
      triggerShake();
      return;
    }

    if (newPin.length < 4 ) {
      setErrorMessage('Please enter a PIN with at least 4 digits.');
      triggerShake();
      return;
    }

    try {
      // console.log('Submitting:', { oldPin, newPin });
      setModalState(prev => ({ ...prev, isLoading: true }));
      const response = await setUserPinView(oldPin, newPin);
      // console.log('API Response:', response);

      if (response.status) {
        await AsyncStorage.setItem('userPin', newPin);
        setModalState({ successVisible: true, errorVisible: false, isLoading: false });
        // Alert.alert('Success', 'Your PIN has been updated successfully.');
      } else {
        setErrorMessage(response.message || 'Failed to update PIN.');
        setModalState({ successVisible: false, errorVisible: true, isLoading: false });
        triggerShake();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred while updating your PIN.';
      console.error('Error in handleSubmit:', errorMsg);
      setModalState({ successVisible: false, errorVisible: true, isLoading: false });
      setErrorMessage(errorMsg); // Displays "Old Pin is not valid" from API
      triggerShake();
    }
  };

    const handleSuccessClose = () => {
      setModalState(prev => ({ ...prev, successVisible: false }));
      router.push({ pathname: 'home' });
    };

    const handleErrorClose = () => {
      setModalState(prev => ({ ...prev, errorVisible: false }));
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent
        headerTitle="Update Your PIN"
        onBackPress={() => router.back()}
      /> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.headerSection}>
              <MaterialIcons name="lock" size={48} color={colors.primary} />
              <Text style={styles.title}>Update Your PIN</Text>
              <Text style={styles.subtitle}>
                Create a new secure PIN for your account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current PIN</Text>
                <View style={[
                  styles.inputContainer, 
                  isFocusedOld && styles.focusedInput,
                  oldPin && styles.filledInput
                ]}>
                  <MaterialIcons name="lock-outline" size={20} color={isFocusedOld ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your current PIN"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={10}
                    value={oldPin}
                    onChangeText={setOldPin}
                    placeholderTextColor={colors.textSecondary}
                    onFocus={() => setIsFocusedOld(true)}
                    onBlur={() => setIsFocusedOld(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New PIN</Text>
                <View style={[
                  styles.inputContainer, 
                  isFocusedNew && styles.focusedInput,
                  newPin && styles.filledInput
                ]}>
                  <MaterialIcons name="vpn-key" size={20} color={isFocusedNew ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your new PIN"
                    keyboardType="numeric"
                    maxLength={10}
                    value={newPin}
                    onChangeText={setNewPin}
                    secureTextEntry
                    placeholderTextColor={colors.textSecondary}
                    onFocus={() => setIsFocusedNew(true)}
                    onBlur={() => setIsFocusedNew(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New PIN</Text>
                <View style={[
                  styles.inputContainer, 
                  isFocusedConfirm && styles.focusedInput,
                  confirmPin && styles.filledInput
                ]}>
                  <MaterialIcons name="check-circle-outline" size={20} color={isFocusedConfirm ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your new PIN"
                    keyboardType="numeric"
                    maxLength={10}
                    value={confirmPin}
                    onChangeText={setConfirmPin}
                    secureTextEntry
                    placeholderTextColor={colors.textSecondary}
                    onFocus={() => setIsFocusedConfirm(true)}
                    onBlur={() => setIsFocusedConfirm(false)}
                  />
                </View>
              </View>

              {errorMessage ? (
                <Animated.View style={[styles.errorContainer, { transform: [{ translateX: shakeAnim }] }]}>
                  <MaterialIcons name="error-outline" size={18} color={colors.error} />
                  <Animated.Text style={styles.errorText}>
                    {errorMessage}
                  </Animated.Text>
                </Animated.View>
              ) : null}
              
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitText}>Update PIN</Text>
                <MaterialIcons name="arrow-forward" size={20} color={colors.textOnPrimary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <MaterialIcons name="security" size={18} color={colors.textSecondary} style={styles.noteIcon} />
              <Text style={styles.noteText}>
                Your PIN helps keep your account secure. Never share it with anyone.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

     <SuccessModal
  visible={modalState.successVisible}
  message="Your PIN has been updated successfully."
  onClose={handleSuccessClose}
/>

          <ErrorModal
  visible={modalState.errorVisible}
  message={errorMessage || "Something went wrong"}
  onClose={handleErrorClose}
/>

                 <Loader visible={modalState.isLoading} message="Please Wait..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundDark,
  },
  focusedInput: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}10`,
  },
  filledInput: {
    backgroundColor: colors.white,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    padding: 0, // Removes default padding on some devices
    letterSpacing: 2, // Adds spacing between characters for PIN input
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: `${colors.error}15`,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 12,
    flexDirection: 'row',
  },
  submitText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  cancelButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  noteIcon: {
    marginRight: 10,
  },
  noteText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default ResetPasswordScreen;