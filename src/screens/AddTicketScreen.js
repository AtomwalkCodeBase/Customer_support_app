import React, { useEffect, useState } from 'react';
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
import { FeedbackSection } from '../components/FeedbackForm';
import { colors } from '../Styles/appStyle';

const AddTicketScreen = ({ visible, onClose, onSave, ticket, isEditMode = false }) => {
  // const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState({ id: null, name: 'Select Category' });
  const [selectedSubCategory, setSelectedSubCategory] = useState({ id: null, name: 'Select Subcategory' });
  const [description, setDescription] = useState('');
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileMimeType, setFileMimeType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hadAttachment, setHadAttachment] = useState(false);
  const [hasSubCategories, setHasSubCategories] = useState(false);

  // Organize categories into main and subcategories
  const organizeCategories = (data) => {
    const mains = data.filter((item) => item.e_type === 'TASK');
    const subs = data.filter((item) => item.e_type === 'T_SUB');
    setMainCategories(mains);
    setSubCategories(subs);
    // setCategories(data);
  };

  // Fetch task categories
  const fetchTaskCategories = async () => {
    try {
      const res = await getTaskCategory();
      organizeCategories(res.data);

      if (isEditMode && ticket?.task_category_id) {
        const category = res.data.find((cat) => cat.id === ticket.task_category_id);
        if (category) {
          if (category.e_type === 'TASK') {
            setSelectedMainCategory(category);
            setSelectedSubCategory({ id: null, name: 'No Subcategory' });
            setHasSubCategories(subCategories.some((sub) => sub.parent_category_id === category.id));
          } else if (category.e_type === 'T_SUB') {
            const parentCategory = res.data.find(
              (cat) => cat.e_type === 'TASK' && cat.id === category.parent_category_id
            );
            if (parentCategory) {
              setSelectedMainCategory(parentCategory);
              setSelectedSubCategory(category);
              setHasSubCategories(true);
            }
          }
        }
      }
    } catch (error) {
      console.log('Failed to fetch categories:', error);
      setErrorMessage('Failed to load categories');
      setErrorVisible(true);
    }
  };

  // Update subcategory visibility and reset subcategory when main category changes
  useEffect(() => {
    if (selectedMainCategory.id) {
      const filteredSubs = subCategories.filter(
        (sub) => sub.parent_category_id === selectedMainCategory.id
      );
      setHasSubCategories(filteredSubs.length > 0);
      if (filteredSubs.length === 0) {
        setSelectedSubCategory({ id: null, name: 'No Subcategory' });
      } else {
        setSelectedSubCategory({ id: null, name: 'Select Subcategory' });
      }
    } else {
      setHasSubCategories(false);
      setSelectedSubCategory({ id: null, name: 'Select Subcategory' });
    }
  }, [selectedMainCategory, subCategories]);

  useEffect(() => {
    if (visible) {
      fetchTaskCategories();
    }
  }, [visible]);

  // Populate form fields when ticket data changes
  useEffect(() => {
    if (isEditMode && ticket) {
      setDescription(ticket.remarks || '');
      if (ticket.image) {
        setFileUri(ticket.image);
        setFileName('attachment.jpg');
        setFileMimeType('image/jpeg');
        setHadAttachment(true);
      } else {
        setFileUri(null);
        setFileName('');
        setFileMimeType('');
        setHadAttachment(false);
      }
    } else {
      resetForm();
    }
  }, [isEditMode, ticket, visible]);

  // Reset form fields
  const resetForm = () => {
    setSelectedMainCategory({ id: null, name: 'Select Category' });
    setSelectedSubCategory({ id: null, name: 'Select Subcategory' });
    setDescription('');
    setFileUri(null);
    setFileName('');
    setFileMimeType('');
    setHadAttachment(false);
    setHasSubCategories(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!description.trim()) {
      setErrorMessage('Please enter a description');
      setErrorVisible(true);
      return;
    }

    if (!isEditMode && !selectedMainCategory.id) {
      setErrorMessage('Please select a category');
      setErrorVisible(true);
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
      formData.append('call_mode', isEditMode ? 'TICKET_UPDATE' : 'TICKET_ADD');
      formData.append('remarks', description.trim());

      if (isEditMode) {
        formData.append('task_id', ticket.id.toString());
        // if (!fileUri && hadAttachment) {
        //   formData.append('remove_attachment', 'true');
        // }
      } else {
        formData.append('task_category_id', selectedMainCategory.id.toString());
        if (selectedSubCategory.id) {
          formData.append('task_sub_category_id', selectedSubCategory.id.toString());
        }
        // formData.append('task_type', 'TICKET');
      }

      if (fileUri) {
        const fileExtension = fileName.split('.').pop() || 'jpg';
        formData.append('uploaded_file', {
          uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
          name: fileName || `attachment.${fileExtension}`,
          type: fileMimeType || `image/${fileExtension}`,
        });
      }

      const res = await addCustomerTicket(formData);
      console.log('addCustomerTicket response:', res.data);

      if (res.status === 200) {
        const updatedTicket = {
          id: res.data.id,
          task_category_id: selectedMainCategory.id,
          task_sub_category_id: selectedSubCategory.id || null,
          remarks: res.data.remarks,
          image: res.data.image || null,
          task_ref_id: res.data.task_ref_id,
          task_status: res.data.task_status,
          task_type: res.data.task_type,
          task_type_display: res.data.task_type_display,
          task_date: res.data.task_date,
          tempId: isEditMode ? null : Date.now().toString(),
        };

        onSave(updatedTicket);
        setSuccessVisible(true);
      } else {
        setErrorMessage('Failed to submit ticket');
        setErrorVisible(true);
      }
    } catch (error) {
      console.log('Submission error:', error);
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
    onClose();
  };

  // Pick document for attachment
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      console.log('DocumentPicker result:', result);

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

  // Remove attached file
  const removeFile = () => {
    setFileUri(null);
    setFileName('');
    setFileMimeType('');
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
            <Text style={styles.headerTitle}>{isEditMode ? 'Edit Ticket' : 'Add New Ticket'}</Text>
            <TouchableOpacity onPress={resetForm} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <DropdownPicker
              label="Main Category"
              value={selectedMainCategory}
              items={mainCategories}
              onSelect={(item) => {
                setSelectedMainCategory(item);
                setSelectedSubCategory({ id: null, name: 'Select Subcategory' });
              }}
              placeholder="Select Category"
              disabled={isEditMode || isLoading}
              isLoading={isLoading}
            />

            {hasSubCategories && (
              <DropdownPicker
                label="Subcategory"
                value={selectedSubCategory}
                items={subCategories.filter(
                  (sub) => sub.parent_category_id === selectedMainCategory.id
                )}
                onSelect={setSelectedSubCategory}
                placeholder="Select Subcategory"
                disabled={isEditMode || isLoading}
                isLoading={isLoading}
              />
            )}

            <TextInputField
              label="Remark"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter ticket description"
              multiline
              numberOfLines={5}
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
              isEditMode={isEditMode}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveTicketButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.saveTicketButtonText}>
              {isEditMode ? 'Update Ticket' : 'Add Ticket'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={successVisible}
        message={isEditMode ? 'Ticket updated successfully!' : 'Ticket submitted successfully!'}
        onClose={handleSuccessClose}
      />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      <Loader visible={isLoading} message={isEditMode ? 'Updating ticket...' : 'Submitting ticket...'} />
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