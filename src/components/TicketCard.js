import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#4CD964'; // Green
    case 'Planned':
      return '#5AC8FA'; // Blue
    case 'In Progress':
      return '#5856D6'; // Purple
    case 'Deleted':
      return '#FF6B6B'; // Red
    case 'Pending':
      return '#FFC107'; // Yellow/Amber
    case 'On Hold':
      return '#FF9500'; // Orange
    case 'Waiting for Response':
      return '#34AADC'; // Light Blue
    case 'Not Planned':
      return '#888888'; // Gray
    default:
      return '#888888'; // Default Gray
  }
};
const TicketCard = ({ ticket, onPress, onEdit }) => {

  return (
    <TouchableOpacity style={styles.ticketCard} onPress={onPress}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketType}>
          {ticket.task_type || ticket.task_type_display || 'N/A'}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ticket.task_status)}33` }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(ticket.task_status) }]}>
            {ticket.task_status || 'N/A'}
          </Text>
        </View>
      </View>
      <Text style={styles.nameText}>{ticket.task_ref_id || 'Unnamed Task'}</Text>
      <Text style={styles.ticketTitle}>{ticket.remarks || 'No description'}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={16} color="#FF6B6B" />
          <Text style={styles.dateText}>{ticket.task_date || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={(e) => {
            e.stopPropagation();
            onEdit(ticket);
          }}
        >
          <Ionicons name="pencil" size={16} color="#FF6B6B" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketType: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default TicketCard;