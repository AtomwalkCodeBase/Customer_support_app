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
import { SuccessModal, ErrorModal, Loader } from '../components/Modals';
import DropdownPicker from '../components/DropdownPicker';
import TextInputField from '../components/TextField';
import FileUploadField from '../components/FilePicker';
import { colors } from '../Styles/appStyle';
import HeaderComponent from '../components/HeaderComponent';

const AddTicketScreen = ({ visible, onClose, onSave }) => {
  // Form state: Store full category objects instead of just IDs
  const [formState, setFormState] = useState({
    mainCategory: null, // { id, name } or null
    subCategory: null, // { id, name } or null
    description: '',
    file: null,
  });

  // Modal state for loading and feedback
  const [modalState, setModalState] = useState({
    isLoading: false,
    successVisible: false,
    errorVisible: false,
    errorMessage: '',
  });

  // Categories data
  const [categories, setCategories] = useState({ main: [], sub: [] });
  const [hasSubCategories, setHasSubCategories] = useState(false);

  // Fetch task categories
  const fetchTaskCategories = useCallback(async () => {
    try {
      const res = await getTaskCategory();
      // console.log('Task Categories API Response:', res.data); // Debug API response
      setCategories({
        main: res.data.filter((item) => item.e_type === 'TASK'),
        sub: res.data.filter((item) => item.e_type === 'T_SUB'),
      });
    } catch (error) {
      setModalState({
        ...modalState,
        errorMessage: 'Failed to load categories',
        errorVisible: true,
      });
    }
  }, []);

  // Check for subcategories when main category changes
  useEffect(() => {
    if (formState.mainCategory?.id) {
      const subCategories = categories.sub.filter(
        (sub) => sub.parent_category_id === formState.mainCategory.id
      );
      setHasSubCategories(subCategories.length > 0);
      setFormState((prev) => ({
        ...prev,
        subCategory: null, // Reset subcategory when main category changes
      }));
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

  // Debug state changes
  // useEffect(() => {
  //   console.log('formState:', formState);
  // }, [formState]);

  // Reset form
  const resetForm = () => {
    setFormState({
      mainCategory: null,
      subCategory: null,
      description: '',
      file: null,
    });
    setHasSubCategories(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formState.description.trim()) {
      setModalState({
        ...modalState,
        errorMessage: 'Please enter a description',
        errorVisible: true,
      });
      return;
    }

    if (!formState.mainCategory?.id) {
      setModalState({
        ...modalState,
        errorMessage: 'Please select a category',
        errorVisible: true,
      });
      return;
    }

    setModalState({ ...modalState, isLoading: true });

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

      if (formState.file) {
        const fileExtension = formState.file.name.split('.').pop() || 'jpg';
        formData.append('uploaded_file', {
          uri: Platform.OS === 'ios' ? formState.file.uri.replace('file://', '') : formState.file.uri,
          name: formState.file.name || `attachment.${fileExtension}`,
          type: formState.file.mimeType || `image/${fileExtension}`,
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
        setModalState({ ...modalState, successVisible: true });
      } else {
        throw new Error('Failed to submit ticket');
      }
    } catch (error) {
      setModalState({
        ...modalState,
        errorMessage: error.message || 'Failed to submit ticket',
        errorVisible: true,
      });
    } finally {
      setModalState({ ...modalState, isLoading: false });
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setModalState({ ...modalState, successVisible: false });
    resetForm();
    onClose();
  };

  // Pick image
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormState({ ...formState, file: result.assets[0] });
      }
    } catch (error) {
      setModalState({
        ...modalState,
        errorMessage: 'Failed to pick image',
        errorVisible: true,
      });
    }
  };

  // Remove image
  const removeFile = () => {
    setFormState({ ...formState, file: null });
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Ticket</Text>
            <TouchableOpacity onPress={resetForm} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View> */}
          <HeaderComponent
            headerTitle="Add New Ticket" 
            onBackPress={onClose}
          />

          <ScrollView style={styles.formContainer}>
            <DropdownPicker
              label="Main Category"
              value={formState.mainCategory} // Pass the full category object
              items={categories.main}
              onSelect={(item) => setFormState({ ...formState, mainCategory: item })}
              placeholder="Select Category"
              disabled={modalState.isLoading}
              isLoading={modalState.isLoading}
            />

            {hasSubCategories && (
              <DropdownPicker
                label="Subcategory"
                value={formState.subCategory} // Pass the full subcategory object
                items={categories.sub.filter((sub) => sub.parent_category_id === formState.mainCategory?.id)}
                onSelect={(item) => setFormState({ ...formState, subCategory: item })}
                placeholder="Select Subcategory"
                disabled={modalState.isLoading}
                isLoading={modalState.isLoading}
              />
            )}

            <TextInputField
              label="Remark"
              value={formState.description}
              onChangeText={(text) => setFormState({ ...formState, description: text })}
              placeholder="Enter ticket description"
              multiline
              numberOfLines={5}
              editable={!modalState.isLoading}
            />

            <FileUploadField
              label="Image"
              fileUri={formState.file?.uri}
              fileName={formState.file?.name}
              onPick={pickDocument}
              onRemove={removeFile}
              isLoading={modalState.isLoading}
              hadAttachment={false}
              isEditMode={false}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveTicketButton, modalState.isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={modalState.isLoading}
          >
            <Text style={styles.saveTicketButtonText}>Add Ticket</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={modalState.successVisible}
        message="Ticket submitted successfully!"
        onClose={handleSuccessClose}
      />
      <ErrorModal
        visible={modalState.errorVisible}
        message={modalState.errorMessage}
        onClose={() => setModalState({ ...modalState, errorVisible: false })}
      />
      <Loader visible={modalState.isLoading} message="Submitting ticket..." />
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