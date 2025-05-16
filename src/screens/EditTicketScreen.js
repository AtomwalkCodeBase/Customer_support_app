import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addCustomerTicket } from '../services/productServices';
import { SuccessModal, ErrorModal, Loader } from '../components/Modals';
import TextInputField from '../components/TextField';
import FileUploadField from '../components/FilePicker';
import { colors } from '../Styles/appStyle';
import DropdownPicker from '../components/DropdownPicker';

const EditTicketScreen = ({ visible, onClose, onSave, ticket }) => {
  const [formState, setFormState] = useState({
    description: '',
    fileUri: null,
    fileName: '',
    fileMimeType: '',
    hadAttachment: false,
  });

  const [modalState, setModalState] = useState({
    isLoading: false,
    successVisible: false,
    errorVisible: false,
    errorMessage: '',
  });

  // Load form data when modal opens
  React.useEffect(() => {
    if (visible && ticket) {
      setFormState({
        description: ticket.remarks || '',
        fileUri: ticket.ref_file || null,
        fileName: ticket.ref_file ? 'attachment.jpg' : '',
        fileMimeType: ticket.ref_file ? 'image/jpeg' : '',
        hadAttachment: !ticket.ref_file,
      });
    }
  }, [visible, ticket]);

  // Reset form
  const resetForm = () => {
    setFormState({
      description: '',
      fileUri: null,
      fileName: '',
      fileMimeType: '',
      hadAttachment: false,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if form is empty (after clearing)
    if (!formState.description.trim() && !formState.fileUri && !formState.hadAttachment) {
      setModalState((prev) => ({
        ...prev,
        errorMessage: 'Please fill in the form before updating',
        errorVisible: true,
      }));
      return;
    }

    setModalState((prev) => ({ ...prev, isLoading: true }));

    try {
      const customer_id = await AsyncStorage.getItem('Customer_id');
      if (!customer_id) {
        throw new Error('Customer ID not found');
      }

      const formData = new FormData();
      formData.append('cust_id', customer_id);
      formData.append('call_mode', 'TICKET_UPDATE');
      formData.append('remarks', formState.description.trim());
      formData.append('task_id', ticket.id.toString());

      // Handle file logic
      if (!formState.fileUri && formState.hadAttachment === false) {
        // Case: No image selected or image cleared
        formData.append('uploaded_file', null); // Send empty string
      } else {
        // Case: New image selected
        const fileExtension = formState.fileName.split('.').pop() || 'jpg';
        formData.append('uploaded_file', {
          uri: Platform.OS === 'ios' ? formState.fileUri.replace('file://', '') : formState.fileUri,
          name: formState.fileName || `attachment.${fileExtension}`,
          type: formState.fileMimeType || `image/${fileExtension}`,
        });
      }

      // Debug: Log FormData
      // console.log('FormData contents:');
      // for (let [key, value] of formData._parts) {
      //   console.log(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
      // }

      const res = await addCustomerTicket(formData);
      // console.log('API Full Response:', {
      //   status: res.status,
      //   data: res.data,
      //   headers: res.headers,
      // });

      if (res.status === 200) {
        // Handle empty or incomplete response
        const updatedTicket = {
          ...ticket,
          remarks: res.data?.remarks || formState.description.trim(),
          // Set ref_file to null if image was cleared, or use API response if available
          ref_file: formState.fileUri ? res.data?.ref_file || null : null,
        };

        if (!res.data || Object.keys(res.data).length === 0) {
          console.warn('API returned empty response, using local formState');
        }

        onSave(updatedTicket);
        setModalState((prev) => ({ ...prev, successVisible: true }));
      } else {
        throw new Error(`Unexpected status code: ${res.status}`);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setModalState((prev) => ({
        ...prev,
        errorMessage: error.message || 'Failed to update ticket',
        errorVisible: true,
      }));
    } finally {
      setModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setModalState((prev) => ({ ...prev, successVisible: false }));
    onClose();
  };

  // Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setFormState((prev) => ({
          ...prev,
          fileUri: file.uri,
          fileName: file.name || 'attachment.jpg',
          fileMimeType: file.mimeType || 'image/jpeg',
        }));
      }
    } catch (error) {
      setModalState((prev) => ({
        ...prev,
        errorMessage: 'Failed to pick image',
        errorVisible: true,
      }));
    }
  };

  // Remove file
    const removeFile = () => {
      setFormState((prev) => ({
        ...prev,
        fileUri: null,
        fileName: '',
        fileMimeType: '',
        hadAttachment: false, // <- Add this to signal image was removed
      }));
    };
  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Ticket</Text>
            <TouchableOpacity onPress={resetForm} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <DropdownPicker
              label="Category"
              value={ticket?.task_category_name || 'N/A'}
              items={[]}
              onSelect={() => {}}
              placeholder="Category"
              disabled={true}
              isLoading={modalState.isLoading}
            />

            {ticket?.task_sub_category_name && (
              <DropdownPicker
                label="Subcategory"
                value={ticket.task_sub_category_name}
                items={[]}
                onSelect={() => {}}
                placeholder="Subcategory"
                disabled={true}
                isLoading={modalState.isLoading}
              />
            )}

            <TextInputField
              label="Remark"
              value={formState.description}
              onChangeText={(text) => setFormState((prev) => ({ ...prev, description: text }))}
              placeholder="Enter ticket description"
              multiline
              numberOfLines={5}
              editable={!modalState.isLoading}
            />

            <FileUploadField
              label="Image"
              fileUri={formState.fileUri}
              fileName={formState.fileName}
              onPick={pickDocument}
              onRemove={removeFile}
              isLoading={modalState.isLoading}
              hadAttachment={formState.hadAttachment}
              isEditMode={true}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveTicketButton, modalState.isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={modalState.isLoading}
          >
            <Text style={styles.saveTicketButtonText}>Update Ticket</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={modalState.successVisible}
        message="Ticket updated successfully!"
        onClose={handleSuccessClose}
      />
      <ErrorModal
        visible={modalState.errorVisible}
        message={modalState.errorMessage}
        onClose={() => setModalState((prev) => ({ ...prev, errorVisible: false }))}
      />
      <Loader visible={modalState.isLoading} message="Updating ticket..." />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  categoryValue: {
    fontSize: 16,
    color: colors.text,
    padding: 10,
    backgroundColor: colors.backgroundLight,
    borderRadius: 5,
  },
  saveTicketButton: {
    marginVertical: 20,
    marginHorizontal: 15,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveTicketButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    opacity: 0.7,
  },
  disabledInput: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.8,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
  },
  disabledContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  disabledLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 5,
  },
});

export default EditTicketScreen;