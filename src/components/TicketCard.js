import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const TicketCard = React.memo(({ ticket, onPress, onEdit }) => {
  const statusConfig = {
    complete: { 
      color: '#008000', // Green
      icon: 'check-circle-outline',
      label: 'Completed',
      bgColor: '#4CD96415'
    },
    completed: { 
      color: '#008000', // Green
      icon: 'check-circle-outline',
      label: 'Complete',
      bgColor: '#4CD96415'
    },
    planned: { 
      color: '#2196F3', // Blue
      icon: 'schedule',
      label: 'Planned',
      bgColor: '#5AC8FA15'
    },
    'in progress': { 
      color: '#5856D6', // Purple
      icon: 'autorenew',
      label: 'In Progress',
      bgColor: '#5856D615'
    },
    deleted: { 
      color: '#FF6B6B', // Red
      icon: 'delete-outline',
      label: 'Deleted',
      bgColor: '#FF6B6B15'
    },
    pending: { 
      color: '#FFC107', // Yellow/Amber
      icon: 'hourglass-empty',
      label: 'Pending',
      bgColor: '#FFC10715'
    },
    'on hold': { 
      color: '#FF9500', // Orange
      icon: 'pause-circle-outline',
      label: 'On Hold',
      bgColor: '#FF950015'
    },
    hold: { 
      color: '#FF9500', // Orange
      icon: 'pause-circle-outline',
      label: 'On Hold',
      bgColor: '#FF950015'
    },
    'waiting for response': { 
      color: '#34AADC', // Light Blue
      icon: 'chat-bubble-outline',
      label: 'Waiting for Response',
      bgColor: '#34AADC15'
    },
    not_planned: { 
      color: '#888888', // Gray
      icon: 'event-busy',
      label: 'Not Planned',
      bgColor: '#88888815'
    },
    'not planned': { 
      color: '#888888', // Gray
      icon: 'event-busy',
      label: 'Not Planned',
      bgColor: '#88888815'
    },
    default: {
      color: '#888888', // Gray
      icon: 'help-outline',
      label: 'Unknown',
      bgColor: '#88888815'
    }
  };

  const priorityConfig = {
    low: { icon: 'keyboard-arrow-down', color: colors.textSecondary || '#666666' },
    medium: { icon: 'remove', color: colors.warning || '#FFC107' },
    high: { icon: 'keyboard-arrow-up', color: colors.error || '#FF3B30' }
  };

  // Normalize status key to lowercase for lookup
  const statusKey = (ticket.task_status || 'default').toLowerCase();
  const status = statusConfig[statusKey] || statusConfig.default;
  const priority = priorityConfig[ticket.priority?.toLowerCase()] || priorityConfig.low;

  return (
    <TouchableOpacity style={[styles.modernCard, { 
      shadowColor: status.color,
      borderLeftColor: status.color,
      borderLeftWidth: 4
    }]} onPress={onPress}>
      {/* Card Header */}
      <View style={styles.modernCardHeader}>
        <View style={styles.ticketIdContainer}>
          <Text style={styles.ticketId}>{ticket.task_ref_id || "No Ticket ID"}</Text>
        </View>
        <View style={[styles.modernStatusBadge, { backgroundColor: status.bgColor }]}>
          <MaterialIcons name={status.icon} size={14} color={status.color} />
          <Text style={[styles.modernStatusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Card Title */}
      <Text style={styles.modernCardTitle} numberOfLines={2}>
        {ticket.remarks || 'No description'}
      </Text>

      {/* Category Tags */}
      <View style={styles.modernTagContainer}>
        <View style={styles.modernTag}>
          <MaterialIcons name="category" size={12} color={colors.textSecondary || '#666666'} />
          <Text style={styles.modernTagText}>{ticket.task_category_name || 'N/A'}</Text>
        </View>
        {ticket.task_sub_category_name && (
          <View style={[styles.modernTag, styles.modernSubTag]}>
            <Text style={styles.modernTagText}>{ticket.task_sub_category_name}</Text>
          </View>
        )}
      </View>

      {/* Card Footer  */}
        <View style={styles.modernCardFooter}>
          <View style={styles.dateContainer}>
            <MaterialIcons name="calendar-month" size={14} color={colors.textSecondary || '#666666'} />
            <Text style={styles.modernDateText}>
              {ticket.task_date 
          ? (() => {
              // Expecting format: DD-MM-YYYY
              const [day, month, year] = ticket.task_date.split('-');
              const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ];
              const monthIndex = parseInt(month, 10) - 1;
              return `${day} ${monthNames[monthIndex]}, ${year}`;
            })()
          : 'N/A'}
            </Text>
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
});

const styles = StyleSheet.create({
  modernCard: {
    backgroundColor: colors.background || '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black || '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#00000008',
  },
  modernCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIdContainer: {
    backgroundColor: colors.backgroundDark || '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary || '#666666',
    fontFamily: 'monospace',
  },
  modernStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modernStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modernCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary || '#000000',
    marginBottom: 16,
    lineHeight: 22,
  },
  modernTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modernTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark || '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  modernSubTag: {
    backgroundColor: colors.primaryTransparent || '#2196F315',
  },
  modernTagText: {
    fontSize: 12,
    color: colors.textSecondary || '#666666',
    fontWeight: '500',
  },
  modernCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernDateText: {
    fontSize: 12,
    color: colors.textSecondary || '#666666',
    fontWeight: '500',
  },
  modernPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  modernPriorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modernEmptyState: {
    backgroundColor: colors.background || '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: colors.black || '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundDark || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary || '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary || '#666666',
    textAlign: 'center',
    lineHeight: 20,
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
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default TicketCard;