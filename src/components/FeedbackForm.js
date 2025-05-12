import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import FileUploadField from './FilePicker';
import { ErrorModal, Loader, SuccessModal } from './Modals';
import { addCustomerTicket } from '../services/productServices';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const FeedbackForm = ({ ticket, visible, onClose, onSubmit }) => {
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileMimeType, setFileMimeType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hadAttachment, setHadAttachment] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // Animation values
  const scaleAnims = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current
  ];
  const labelOpacity = useRef(new Animated.Value(0)).current;

  // Emoji and label data
  const emojiData = [
    { emoji: '😞', label: 'Terrible' },
    { emoji: '🙁', label: 'Bad' },
    { emoji: '😐', label: 'Ok' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😄', label: 'Great' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setSelectedRating(null);
    setRemarks('');
    setFileUri(null);
    setFileName('');
    setFileMimeType('');
    setHadAttachment(false);
    setErrorMessage('');
    setErrorVisible(false);
    setSuccessVisible(false);
    labelOpacity.setValue(0);
    scaleAnims.forEach(anim => anim.setValue(1));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setFileUri(file.uri);
        setFileName(file.name || 'attachment.jpg');
        setFileMimeType(file.mimeType || 'image/jpeg');
      }
    } catch (error) {
      console.log('DocumentPicker error:', error);
      setErrorMessage('Failed to pick image');
      setErrorVisible(true);
    }
  };

  const removeFile = () => {
    setFileUri(null);
    setFileName('');
    setFileMimeType('');
    setHadAttachment(false);
  };

  const handleSelectRating = (index) => {
    scaleAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }).start();
    });

    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.4,
        duration: 200,
        easing: Easing.bounce,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1.2,
        duration: 100,
        easing: Easing.bounce,
        useNativeDriver: true
      })
    ]).start();

    Animated.timing(labelOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();

    setSelectedRating(index);
    console.log("index", index + 1);
    
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedRating === null) {
      setErrorMessage('Please select a rating');
      setErrorVisible(true);
      return;
    }

    setIsLoading(true);
    setErrorVisible(false);

    try {
		const customer_id = await AsyncStorage.getItem('Customer_id');

      const formData = new FormData();
	  formData.append('cust_id', customer_id);
      formData.append('task_id', ticket.id.toString());
      formData.append('remarks', remarks);
	  formData.append('call_mode', 'TICKET_FEEDBACK');
	  formData.append('feedback_rating', selectedRating + 1);

      if (fileUri) {
		const fileExtension = fileName.split('.').pop() || 'jpg';
         formData.append('uploaded_file', {
			uri:  fileUri,
			name: fileName || `attachment.${fileExtension}`,
			type: fileMimeType || `image/${fileExtension}`,
		});
      }

      // Call the addCustomerTicket API
       const res = await addCustomerTicket(formData);
	  console.log("FeedbackForm", res.data);

      // Notify parent component of successful submission
      onSubmit({
        ticket_id: ticket.id,
        remarks,
        fileUri,
        fileName,
        fileMimeType
      });

      setSuccessVisible(true);
      console.log('FeedbackForm submitted:', { ticket_id: ticket.id, remarks, fileUri, fileName, fileMimeType });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          onClose();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled={true}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.modalTitle}>How was your experience?</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        resetForm();
                        onClose();
                      }} 
                      style={styles.closeButton}
                    >
                      <Feather name="x" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionTitle}>Rate your satisfaction</Text>

                  <View style={styles.emojiContainer}>
                    {emojiData.map((item, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => handleSelectRating(index)}
                        style={[
                          styles.emojiButton,
                          selectedRating === index && styles.selectedEmoji
                        ]}
                      >
                        <Animated.Text 
                          style={[
                            styles.emoji,
                            { transform: [{ scale: scaleAnims[index] }] }
                          ]}
                        >
                          {item.emoji}
                        </Animated.Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {selectedRating !== null && (
                    <Animated.Text 
                      style={[styles.ratingLabel, { opacity: labelOpacity }]}
                    >
                      {emojiData[selectedRating].label}
                    </Animated.Text>
                  )}

                  <Text style={styles.sectionTitle}>Additional comments</Text>
                  <TextInput
                    style={styles.remarksInput}
                    placeholder="Please share your feedback..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={remarks}
                    onChangeText={setRemarks}
                    editable={!isLoading}
                  />

                  <FileUploadField
                    label="Image"
                    fileUri={fileUri}
                    fileName={fileName}
                    onPick={pickDocument}
                    onRemove={removeFile}
                    isLoading={isLoading}
                    hadAttachment={hadAttachment}
                  />

                  {errorVisible && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  )}

                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={[
                        styles.submitButton,
                        (selectedRating === null || isLoading) && styles.disabledButton
                      ]}
                      onPress={handleSubmit}
                      disabled={selectedRating === null || isLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {isLoading ? 'Submitting...' : 'Submit Feedback'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={successVisible}
        message="Feedback submitted successfully!"
        onClose={handleSuccessClose}
      />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      <Loader
        visible={isLoading}
        message="Submitting feedback..."
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  emojiButton: {
    padding: 10,
    borderRadius: 50,
  },
  selectedEmoji: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  emoji: {
    fontSize: 28,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F9F9F9',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
});