import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addCustomerTicket } from '../services/productServices';
import { SuccessModal, ErrorModal } from '../components/Modals';
import TextInputField from '../components/TextField';
import FileUploadField from '../components/FilePicker';
import { colors } from '../Styles/appStyle';
import DropdownPicker from '../components/DropdownPicker';
import HeaderComponent from '../components/HeaderComponent';
import Loader from '../components/Loader';

const EditTicketScreen = ({ visible, onClose, onSave, ticket }) => {
  const [formState, setFormState] = useState({
    description: '',
    fileUri: null,
    fileName: '',
    fileMimeType: '',
    hadAttachment: false,
  });

    const [isLoading, setIsLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

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
  // const resetForm = () => {
  //   setFormState({
  //     description: '',
  //     fileUri: null,
  //     fileName: '',
  //     fileMimeType: '',
  //     hadAttachment: false,
  //   });
  // };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if form is empty (after clearing)
    let errors = {};
    if (!formState.description.trim()) {
      errors.description = "Please provide a description";
    }
    setFieldErrors(errors);
  
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

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

      const originalHadFile = !!ticket.ref_file;
      const fileRemoved = originalHadFile && !formState.fileUri;

      if (fileRemoved) {
        formData.append('uploaded_file', '');
      }
      else if (formState.fileUri && formState.fileUri !== ticket.ref_file) {
        const fileExtension = formState.fileName.split('.').pop() || 'jpg';
        formData.append('uploaded_file', {
          uri: Platform.OS === 'ios' ? formState.fileUri.replace('file://', '') : formState.fileUri,
          name: formState.fileName || `attachment.${fileExtension}`,
          type: formState.fileMimeType || `image/${fileExtension}`,
        });
      }

      const res = await addCustomerTicket(formData);

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
        setSuccessVisible(true);
      } else {
        throw new Error(`Unexpected status code: ${res.status}`);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setErrorMessage(error.message || 'Failed to update ticket');
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setSuccessVisible(false);
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
      setErrorMessage('Failed to pick image');
      setErrorVisible(true);
    }
  };

  // Remove file
    const removeFile = () => {
      setFormState((prev) => ({
        ...prev,
        fileUri: null,
        fileName: '',
        fileMimeType: '',
        hadAttachment: true, 
      }));
    };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <HeaderComponent
            headerTitle="Edit Ticket" 
            onBackPress={onClose}
          />

          <ScrollView style={styles.formContainer}>
            <DropdownPicker
              label="Category"
              value={ticket?.task_category_name || 'N/A'}
              items={[]}
              onSelect={() => {}}
              placeholder="Category"
              disabled={true}
              isLoading={isLoading}
            />

            {ticket?.task_sub_category_name && (
              <DropdownPicker
                label="Subcategory"
                value={ticket.task_sub_category_name}
                items={[]}
                onSelect={() => {}}
                placeholder="Subcategory"
                disabled={true}
                isLoading={isLoading}
              />
            )}

            <TextInputField
              label="Description"
              value={formState.description}
              onChangeText={(text) => setFormState((prev) => ({ ...prev, description: text }))}
              placeholder="Enter ticket description"
              multiline
              numberOfLines={5}
              editable={!isLoading}
              errorMessage={fieldErrors.description}
            />

            <FileUploadField
              label="Image"
              fileUri={formState.fileUri}
              fileName={formState.fileName}
              onFileChange={({ uri, name, mimeType }) => {
                setFormState({ ...formState, fileUri: uri, fileName: name, fileMimeType: mimeType });
              }}
              onRemove={removeFile}
              isLoading={isLoading}
              hadAttachment={formState.hadAttachment}
              isEditMode={true}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveTicketButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.saveTicketButtonText}>Update Ticket</Text>
          </TouchableOpacity>

        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={successVisible}
        message="Ticket updated successfully!"
        onClose={handleSuccessClose}
        onAutoClose={() => {
          setSuccessVisible(false);
          onClose()
        }}
        autoCloseDelay={3000}

      />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      /> 
      <Loader visible={isLoading} message="Updating ticket..." />
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