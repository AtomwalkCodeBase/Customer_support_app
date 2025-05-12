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

const EditTicketScreen = ({ visible, onClose, onSave, ticket }) => {
  const [formState, setFormState] = useState({
    mainCategory: { id: null, name: ticket.task_category_name },
    subCategory: { id: null, name: ticket.task_sub_category_name },
    description: '',
    fileUri: null,
    fileName: '',
    fileMimeType: '',
    hadAttachment: false,
    hasSubCategories: false,
  });
  const [categories, setCategories] = useState({ main: [], sub: [] });
  const [modalState, setModalState] = useState({
    isLoading: false,
    successVisible: false,
    errorVisible: false,
    errorMessage: '',
  });

  console.log("edit form ", ticket)

  // Memoized category organization
  const organizeCategories = useCallback((data) => {
    const mains = data.filter((item) => item.e_type === 'TASK');
    const subs = data.filter((item) => item.e_type === 'T_SUB');
    setCategories({ main: mains, sub: subs });
  }, []);

  // Fetch task categories and populate for edit mode
  const fetchTaskCategories = useCallback(async () => {
    try {
      const res = await getTaskCategory();
      organizeCategories(res.data);

      if (ticket?.task_category_id) {
        const category = res.data.find((cat) => cat.id === ticket.task_category_id);
        if (category) {
          if (category.e_type === 'TASK') {
            const hasSubCats = res.data.some((sub) => sub.parent_category_id === category.id && sub.e_type === 'T_SUB');
            setFormState((prev) => ({
              ...prev,
              mainCategory: { id: category.id, name: category.name },
              subCategory: hasSubCats ? prev.subCategory : { id: null, name: 'No Subcategory' },
              hasSubCategories: hasSubCats,
            }));
          } else if (category.e_type === 'T_SUB') {
            const parentCategory = res.data.find(
              (cat) => cat.e_type === 'TASK' && cat.id === category.parent_category_id
            );
            if (parentCategory) {
              setFormState((prev) => ({
                ...prev,
                mainCategory: { id: parentCategory.id, name: parentCategory.name },
                subCategory: { id: category.id, name: category.name },
                hasSubCategories: true,
              }));
            }
          }
        }
      }
    } catch (error) {
      setModalState((prev) => ({
        ...prev,
        errorMessage: 'Failed to load categories',
        errorVisible: true,
      }));
    }
  }, [ticket, organizeCategories]);

  // Load categories and populate form when modal opens
  useEffect(() => {
    if (visible && ticket) {
      fetchTaskCategories();
      setFormState((prev) => ({
        ...prev,
        description: ticket.remarks || '',
        fileUri: ticket.ref_file || null,
        fileName: ticket.ref_file ? 'attachment.jpg' : '',
        fileMimeType: ticket.ref_file ? 'image/jpeg' : '',
        hadAttachment: !!ticket.ref_file,
      }));
    }
  }, [visible, ticket, fetchTaskCategories]);

  // Reset form
  const resetForm = () => {
    setFormState({
      mainCategory: { id: null, name: 'Select Category' },
      subCategory: { id: null, name: 'Select Subcategory' },
      description: ticket?.remarks || '',
      fileUri: ticket?.ref_file || null,
      fileName: ticket?.ref_file ? 'attachment.jpg' : '',
      fileMimeType: ticket?.ref_file ? 'image/jpeg' : '',
      hadAttachment: !!ticket?.ref_file,
      hasSubCategories: false,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formState.description.trim()) {
      setModalState((prev) => ({
        ...prev,
        errorMessage: 'Please enter a description',
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

      if (!formState.fileUri && formState.hadAttachment) {
        formData.append('remove_attachment', 'true');
      }

      if (formState.fileUri && !formState.hadAttachment) {
        const fileExtension = formState.fileName.split('.').pop() || 'jpg';
        formData.append('uploaded_file', {
          uri: Platform.OS === 'ios' ? formState.fileUri.replace('file://', '') : formState.fileUri,
          name: formState.fileName || `attachment.${fileExtension}`,
          type: formState.fileMimeType || `image/${fileExtension}`,
        });
      }

      const res = await addCustomerTicket(formData);
      if (res.status === 200) {
        const updatedTicket = {
          id: res.data.id,
          task_category_id: formState.mainCategory.id,
          task_sub_category_id: formState.subCategory.id || null,
          remarks: res.data.remarks,
          ref_file: res.data.ref_file || null,
          task_ref_id: res.data.task_ref_id,
          task_status: res.data.task_status,
          task_type: res.data.task_type,
          task_type_display: res.data.task_type_display,
          task_date: res.data.task_date,
        };

        onSave(updatedTicket);
        setModalState((prev) => ({ ...prev, successVisible: true }));
      } else {
        throw new Error('Failed to update ticket');
      }
    } catch (error) {
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
    resetForm();
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
              label="Main Category"
              value={formState.mainCategory}
              items={categories.main}
              onSelect={() => {}} // Non-editable
              placeholder="Select Category"
              disabled={true}
              isLoading={modalState.isLoading}
            />

            {formState.hasSubCategories && (
              <DropdownPicker
                label="Subcategory"
                value={formState.subCategory}
                items={categories.sub.filter(
                  (sub) => sub.parent_category_id === formState.mainCategory.id
                )}
                onSelect={() => {}} // Non-editable
                placeholder="Select Subcategory"
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

export default EditTicketScreen;