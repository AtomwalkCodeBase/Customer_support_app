import React, { useEffect, useState, useCallback } from 'react';
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
import { addCustomerTicket, getTaskCategory } from '../services/productServices';
import { SuccessModal, ErrorModal } from '../components/Modals';
import DropdownPicker from '../components/DropdownPicker';
import TextInputField from '../components/TextField';
import FileUploadField from '../components/FilePicker';
import { colors } from '../Styles/appStyle';
import HeaderComponent from '../components/HeaderComponent';
import Loader from '../components/Loader';

const AddTicketScreen = ({ visible, onClose, onSave }) => {
  // Form state: Store full category objects instead of just IDs
  const [formState, setFormState] = useState({
    mainCategory: null, // { id, name } or null
    subCategory: null, // { id, name } or null
    description: '',
    fileUri: null,
    fileName: '',
    fileMimeType: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Categories data
  const [categories, setCategories] = useState({ main: [], sub: [] });
  const [hasSubCategories, setHasSubCategories] = useState(false);

  // Fetch task categories
  const fetchTaskCategories = useCallback(async () => {
    try {
      const res = await getTaskCategory();
      setCategories({
        main: res.data.filter((item) => item.e_type === 'TASK'),
        sub: res.data.filter((item) => item.e_type === 'T_SUB'),
      });
    } catch (error) {
      setErrorMessage('Failed to load categories');
      setErrorVisible(true);
    }
  }, []);

  // Check for subcategories when main category changes
  useEffect(() => {
    if (formState.mainCategory?.id) {
      const subCategories = categories.sub.filter(
        (sub) => sub.parent_category_id === formState.mainCategory.id
      );
      setHasSubCategories(subCategories.length > 0);
      setFormState((prev) => ({...prev, subCategory: null}));
    } else {
      setHasSubCategories(false);
      setFormState((prev) => ({ ...prev, subCategory: null }));
    }
  }, [formState.mainCategory, categories.sub]);

  // Load categories when modal opens
  useEffect(() => {
    if (visible) {
      fetchTaskCategories();
      resetForm();
    }
  }, [visible, fetchTaskCategories]);


  // Reset form
  const resetForm = () => {
    setFormState({
      mainCategory: null,
      subCategory: null,
      description: '',
      fileUri: null,
      fileName: '',
      fileMimeType: '',
    });
    setHasSubCategories(false);
    setFieldErrors({}); // Clear field errors
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form 
    let errors = {};
    if (!formState.mainCategory?.id) {
      errors.mainCategory = "Please select a category";
    }
    if (hasSubCategories && !formState.subCategory?.id) {
      errors.subCategory = "Please select a sub category";
    }
    if (!formState.description) {
      errors.description = "Please enter a description";
    }
    setFieldErrors(errors);
  
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsLoading(true)

    try {
      const customerId = await AsyncStorage.getItem('Customer_id');
      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('cust_id', customerId);
      formData.append('call_mode', 'TICKET_ADD');
      formData.append('remarks', formState.description.trim());
      formData.append('task_category_id', formState.mainCategory.id.toString());
      if (formState.subCategory?.id) {
        formData.append('task_sub_category_id', formState.subCategory.id.toString());
      }

      if (formState.fileUri) {
        const fileExtension = formState.fileName?.split('.').pop() || 'jpg';
        formData.append('uploaded_file', {
          uri: Platform.OS === 'ios' ? formState.fileUri.replace('file://', '') : formState.fileUri,
          name: formState.fileName || `attachment.${fileExtension}`,
          type: formState.fileMimeType || `image/${fileExtension}`,
        });
      }

      // Make API call
      const res = await addCustomerTicket(formData);
      // console.log('API Response:', res.data);

      if (res.status === 200) {
        // Construct ticket object for onSave
        const newTicket = {
          id: res.data.id,
          task_category_id: formState.mainCategory.id,
          task_sub_category_id: formState.subCategory?.id || null,
          remarks: res.data.remarks,
          ref_file: res.data.ref_file || null,
          task_ref_id: res.data.task_ref_id,
          task_status: res.data.task_status,
          task_type: res.data.task_type,
          task_type_display: res.data.task_type_display,
          tempId: Date.now().toString(),
        };

        onSave(newTicket);
        setSuccessVisible(true);
      } else {
        throw new Error('Failed to submit ticket');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit ticket');
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setSuccessVisible(false);
    resetForm();
    setFieldErrors({});
    onClose();
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleSuccessClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <HeaderComponent
            headerTitle="Add New Ticket" 
            onBackPress={handleSuccessClose}
          />

          <ScrollView style={styles.formContainer}>
            <DropdownPicker
              label="Main Category"
              value={formState.mainCategory}
              items={categories.main}
              onSelect={(item) => setFormState({ ...formState, mainCategory: item })}
              placeholder="Select Category"
              disabled={isLoading}
              isLoading={isLoading}
              errorMessage={fieldErrors.mainCategory}
            />

            {hasSubCategories && (
              <DropdownPicker
                label="Subcategory"
                value={formState.subCategory}
                items={categories.sub.filter((sub) => sub.parent_category_id === formState.mainCategory?.id)}
                onSelect={(item) => setFormState({ ...formState, subCategory: item })}
                placeholder="Select Subcategory"
                disabled={isLoading}
                isLoading={isLoading}
                errorMessage={fieldErrors.subCategory}
              />
            )}

            <TextInputField
              label="Description"
              value={formState.description}
              onChangeText={(text) => setFormState({ ...formState, description: text })}
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
                  console.log('onFileChange', uri, name, mimeType);
                  setFormState((prev) => ({
                    ...prev,
                    fileUri: uri,
                    fileName: name,
                    fileMimeType: mimeType,
                  }));
                }}
                onRemove={() => setFormState((prev) => ({
                  ...prev,
                  fileUri: null,
                  fileName: '',
                  fileMimeType: '',
                }))}
                isLoading={isLoading}
                hadAttachment={false}
                isEditMode={false}
              />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveTicketButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.saveTicketButtonText}>Add Ticket</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={successVisible}
        message="Ticket submitted successfully!"
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
      <Loader visible={isLoading} message="Submitting ticket..." />
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
});

export default AddTicketScreen;