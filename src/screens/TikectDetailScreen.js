import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FeedbackSection from '../components/FeedbackSection';

// Reusable component for info items
const InfoItem = ({ icon, label, value, onPress, isLink }) => {
  if (!value) return null;
  
  return (
    <TouchableOpacity 
      style={styles.infoItem}
      disabled={!onPress}
      onPress={onPress}
    >
      <View style={styles.infoIcon}>
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text 
          style={[
            styles.infoValue, 
            isLink && styles.linkText
          ]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
      {isLink && (
        <Feather name="external-link" size={16} color="#FF6B6B" style={styles.linkIcon} />
      )}
    </TouchableOpacity>
  );
};

// Status Badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return '#4CD964'; // Green
      case 'Resolved':
        return '#4CD964'; // Green
      case 'Planned':
        return '#5AC8FA'; // Blue
      case 'In Progress':
        return '#5856D6'; // Purple
      case 'Rejected':
        return '#FF6B6B'; // Red
      case 'Pending':
        return '#FFC107'; // Yellow/Amber
      case 'On Hold':
        return '#FF9500'; // Orange
      case 'Wait for Response':
        return '#34AADC'; // Light Blue
      case 'Not Planned':
        return '#888888'; // Gray
      default:
        return '#888888'; // Default Gray
    }
  };

  return (
    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(status) + '20'}]}>
      <Text style={[styles.statusText, {color: getStatusColor(status)}]}>{status}</Text>
    </View>
  );
};

// Function to convert priority number to text
const getPriorityText = (priority) => {
  switch(priority) {
    case '01':
      return 'High';
    case '02':
      return 'Medium';
    case '03':
      return 'Low';
    default:
      return `Priority ${priority}`;
  }
};

const TicketDetailScreen = () => {
	const { params } = useLocalSearchParams(); 
	const ticket = JSON.parse(params); 
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    // Here you'd typically send the feedback to your API
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <TouchableOpacity  style={styles.editButton}>
          {/* <Feather name="edit" size={20} color="white" /> */}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Ticket ID and Type Section */}
        <View style={styles.ticketInfoSection}>
          <View style={styles.ticketIdRow}>
            <Text style={styles.ticketId}>{ticket.task_ref_id}</Text>
            <StatusBadge status={ticket.task_status} />
          </View>
          <View style={styles.typeRow}>
            <View style={styles.typeBadge}>
              {/* <Text style={styles.typeText}>{ticket.task_type_display}</Text> */}
              <Text style={styles.typeText}>{ticket.task_category_name}</Text>
            </View>
            <Text style={styles.dateText}>{ticket.task_date}</Text>
          </View>
        </View>

        {/* Ticket Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ticket Details</Text>
          </View>
          
          <InfoItem 
            icon={<Feather name="file-text" size={20} color="#FF6B6B" />}
            label="Remarks"
            value={ticket.remarks}
          />
          
          {/* <InfoItem 
            icon={<Feather name="user" size={20} color="#FF6B6B" />}
            label="Assigned To"
            value={ticket.emp_assigned ? ticket.emp_assigned : "Not Assigned"}
          /> */}
          
          <InfoItem 
            icon={<Feather name="flag" size={20} color="#FF6B6B" />}
            label="Priority"
            value={getPriorityText(ticket.priority)}
          />
        </View>


          <FeedbackSection 
            ticket={ticket} 
            onSubmitFeedback={handleFeedbackSubmit}
          />
      </ScrollView>

      {/* <AddTicketScreen
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTicket(null);
          setIsEditMode(false);
        }}
        onSave={handleSaveTicket}
        ticket={selectedTicket}
        isEditMode={isEditMode}
      /> */}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  ticketInfoSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  customerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#FF6B6B',
  },
  linkIcon: {
    marginLeft: 8,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  ownerInfo: {
    marginLeft: 15,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default TicketDetailScreen;