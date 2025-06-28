import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color theme
const colors = {
  primary: '#FF6B6B',
  primaryTransparent: '#ff550033',
  textPrimary: '#333',
  textSecondary: '#777E90',
  textOnPrimary: '#FFFFFF',
  background: '#FFFFFF',
  backgroundDark: '#F5F5F5',
  backgroundDarker: '#1E1E1E',
  border: '#9B9B9A',
  error: '#ED1010',
  success: 'green',
  warning: '#FFC300',
  muted: '#eee',
  black: '#000000',
  white: '#FFFFFF',
};

// Mock data
const mockTickets = [
  {
    id: "TKT-1001",
    title: "Login page not loading on mobile",
    category: "Authentication",
    subCategory: "Login",
    status: "complete",
    createdAt: "2023-10-15T09:30:00Z",
    updatedAt: "2023-10-16T14:15:00Z",
    priority: "high"
  },
  {
    id: "TKT-1002",
    title: "Dashboard analytics incorrect",
    category: "Dashboard",
    subCategory: "Analytics",
    status: "planned",
    createdAt: "2023-10-18T11:20:00Z",
    updatedAt: "2023-10-20T10:45:00Z",
    priority: "medium"
  },
  {
    id: "TKT-1003",
    title: "User profile picture not uploading",
    category: "Profile",
    subCategory: "Media Upload",
    status: "hold",
    createdAt: "2023-10-20T14:10:00Z",
    updatedAt: "2023-10-22T16:30:00Z",
    priority: "high"
  },
  {
    id: "TKT-1004",
    title: "Notification sound too loud",
    category: "Notifications",
    subCategory: "Sound",
    status: "not_planned",
    createdAt: "2023-10-22T08:45:00Z",
    updatedAt: "2023-10-22T09:15:00Z",
    priority: "low"
  },
  {
    id: "TKT-1005",
    title: "Dark mode toggle not working",
    category: "UI",
    subCategory: "Theme",
    status: "complete",
    createdAt: "2023-10-25T13:20:00Z",
    updatedAt: "2023-10-26T11:05:00Z",
    priority: "medium"
  },
  {
    id: "TKT-1006",
    title: "API timeout during bulk upload",
    category: "API",
    subCategory: "Performance",
    status: "planned",
    createdAt: "2023-10-28T16:30:00Z",
    updatedAt: "2023-10-29T10:20:00Z",
    priority: "high"
  },
  {
    id: "TKT-1007",
    title: "Typo in welcome message",
    category: "Content",
    subCategory: "Copy Text",
    status: "complete",
    createdAt: "2023-11-01T10:15:00Z",
    updatedAt: "2023-11-01T11:30:00Z",
    priority: "low"
  },
  {
    id: "TKT-1008",
    title: "Password reset link expired too soon",
    category: "Authentication",
    subCategory: "Password Reset",
    status: "hold",
    createdAt: "2023-11-05T09:10:00Z",
    updatedAt: "2023-11-07T14:25:00Z",
    priority: "medium"
  },
  {
    id: "TKT-1009",
    title: "Search results not relevant",
    category: "Search",
    subCategory: "Algorithm",
    status: "not_planned",
    createdAt: "2023-11-08T11:40:00Z",
    updatedAt: "2023-11-08T12:15:00Z",
    priority: "high"
  },
  {
    id: "TKT-1010",
    title: "Mobile menu overlaps content",
    category: "UI",
    subCategory: "Navigation",
    status: "planned",
    createdAt: "2023-11-10T15:20:00Z",
    updatedAt: "2023-11-12T09:45:00Z",
    priority: "medium"
  },
  {
    id: "TKT-1011",
    title: "Export to PDF missing columns",
    category: "Reports",
    subCategory: "Export",
    status: "complete",
    createdAt: "2023-11-15T14:10:00Z",
    updatedAt: "2023-11-16T10:30:00Z",
    priority: "high"
  },
  {
    id: "TKT-1012",
    title: "Incorrect timezone display",
    category: "Localization",
    subCategory: "Timezone",
    status: "hold",
    createdAt: "2023-11-18T10:45:00Z",
    updatedAt: "2023-11-20T16:15:00Z",
    priority: "low"
  },
  {
    id: "TKT-1013",
    title: "Duplicate notifications received",
    category: "Notifications",
    subCategory: "Delivery",
    status: "planned",
    createdAt: "2023-11-22T13:30:00Z",
    updatedAt: "2023-11-23T11:20:00Z",
    priority: "medium"
  },
  {
    id: "TKT-1014",
    title: "Profile save button disabled",
    category: "Profile",
    subCategory: "Form",
    status: "not_planned",
    createdAt: "2023-11-25T09:15:00Z",
    updatedAt: "2023-11-25T10:05:00Z",
    priority: "low"
  },
  {
    id: "TKT-1015",
    title: "Chart colors not accessible",
    category: "Dashboard",
    subCategory: "Visualization",
    status: "complete",
    createdAt: "2023-11-28T14:50:00Z",
    updatedAt: "2023-11-29T12:30:00Z",
    priority: "high"
  }
];

// Modern Stat Card Component
const StatCard = ({ count, label, color, icon }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

// Modern Ticket Card Component
const TicketCard = React.memo(({ ticket }) => {
  const statusConfig = {
    complete: { 
      color: colors.success, 
      icon: 'check-circle-outline',
      label: 'Complete',
      bgColor: '#4CAF5015'
    },
    planned: { 
      color: '#2196F3', 
      icon: 'schedule',
      label: 'Planned',
      bgColor: '#2196F315'
    },
    not_planned: { 
      color: colors.warning, 
      icon: 'schedule',
      label: 'Not Planned',
      bgColor: '#FFC30015'
    },
    hold: { 
      color: colors.error, 
      icon: 'pause-circle-outline',
      label: 'On Hold',
      bgColor: '#ED101015'
    }
  };

  const priorityConfig = {
    low: { icon: 'keyboard-arrow-down', color: colors.textSecondary },
    medium: { icon: 'remove', color: colors.warning },
    high: { icon: 'keyboard-arrow-up', color: colors.error }
  };

  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  return (
    <View style={[styles.modernCard, { 
      shadowColor: status.color,
      borderLeftColor: status.color,
      borderLeftWidth: 4
    }]}>
      {/* Card Header */}
      <View style={styles.modernCardHeader}>
        <View style={styles.ticketIdContainer}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
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
        {ticket.title}
      </Text>

      {/* Category Tags */}
      <View style={styles.modernTagContainer}>
        <View style={styles.modernTag}>
          <MaterialIcons name="category" size={12} color={colors.textSecondary} />
          <Text style={styles.modernTagText}>{ticket.category}</Text>
        </View>
        {ticket.subCategory && (
          <View style={[styles.modernTag, styles.modernSubTag]}>
            <Text style={styles.modernTagText}>{ticket.subCategory}</Text>
          </View>
        )}
      </View>

      {/* Card Footer */}
      <View style={styles.modernCardFooter}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="schedule" size={14} color={colors.textSecondary} />
          <Text style={styles.modernDateText}>
            {new Date(ticket.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View style={[styles.modernPriority, { backgroundColor: `${priority.color}15` }]}>
          <MaterialIcons name={priority.icon} size={16} color={priority.color} />
          <Text style={[styles.modernPriorityText, { color: priority.color }]}>
            {ticket.priority}
          </Text>
        </View>
      </View>
    </View>
  );
});

const Demo = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [filterValue, setFilterValue] = useState(null);
  const [isFilterFocus, setIsFilterFocus] = useState(false);
  const [isValueFocus, setIsValueFocus] = useState(false);

  // Filter options for first dropdown
  const filterOptions = [
    { label: 'Category', value: 'category' },
    { label: 'Sub Category', value: 'subCategory' },
    { label: 'Date', value: 'date' },
    { label: 'Status', value: 'status' },
  ];

  // Dynamic options for second dropdown
  const valueOptions = useMemo(() => {
    if (!filterType) return [];

    const uniqueValues = new Set();

    tickets.forEach(ticket => {
      if (filterType === 'date') {
        uniqueValues.add(new Date(ticket.createdAt).toLocaleDateString());
      } else {
        const value = ticket[filterType];
        if (value) uniqueValues.add(value);
      }
    });

    return Array.from(uniqueValues).map(value => ({
      label: value,
      value
    }));
  }, [filterType, tickets]);

  // Filter tickets based on search and filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search filter
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      let matchesFilter = true;
      if (filterType && filterValue) {
        if (filterType === 'date') {
          matchesFilter = new Date(ticket.createdAt).toLocaleDateString() === filterValue;
        } else {
          matchesFilter = ticket[filterType] === filterValue;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [tickets, searchQuery, filterType, filterValue]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const complete = tickets.filter(t => t.status === 'complete').length;
    const planned = tickets.filter(t => t.status === 'planned').length;
    const notPlanned = tickets.filter(t => t.status === 'not_planned').length;
    const hold = tickets.filter(t => t.status === 'hold').length;

    return { complete, planned, notPlanned, hold, total };
  }, [tickets]);

  const resetFilters = () => {
    setFilterType(null);
    setFilterValue(null);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Modern Header */}
        {/* <View style={styles.modernHeader}>
          <View>
            <Text style={styles.headerTitle}>Ticket Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage and track all tickets</Text>
          </View>
        </View> */}

        {/* Modern Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            count={stats.complete} 
            label="Complete" 
            color="#008000"
            icon="check-circle-outline"
          />
          <StatCard 
            count={stats.planned} 
            label="Planned" 
            color="#2196F3"
            icon="schedule"
          />
          <StatCard 
            count={stats.notPlanned} 
            label="Not Planned" 
            color={colors.warning}
            icon="event-busy"
          />
          <StatCard 
            count={stats.hold} 
            label="On Hold" 
            color={colors.error}
            icon="pause-circle-outline"
          />
        </View>

        {/* Modern Search Bar */}
        <View style={styles.modernSearchContainer}>
          <View style={styles.modernSearchBar}>
            <MaterialIcons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.modernSearchInput}
              placeholder="Search tickets or ID..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="clear" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Modern Filter Section */}
        <View style={styles.modernFilterSection}>
          <Text style={styles.filterTitle}>Filters</Text>
          <View style={styles.modernFilters}>
            <Dropdown
              style={[styles.modernDropdown, isFilterFocus && styles.modernDropdownFocus]}
              placeholderStyle={styles.modernPlaceholder}
              selectedTextStyle={styles.modernSelectedText}
              data={filterOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Filter by..."
              value={filterType}
              onFocus={() => setIsFilterFocus(true)}
              onBlur={() => setIsFilterFocus(false)}
              onChange={item => {
                setFilterType(item.value);
                setFilterValue(null);
                setIsFilterFocus(false);
              }}
              renderLeftIcon={() => (
                <MaterialIcons
                  name="filter-list"
                  size={18}
                  color={isFilterFocus ? colors.primary : colors.textSecondary}
                />
              )}
            />

            <Dropdown
              style={[
                styles.modernDropdown, 
                isValueFocus && styles.modernDropdownFocus,
                !filterType && styles.modernDropdownDisabled
              ]}
              placeholderStyle={styles.modernPlaceholder}
              selectedTextStyle={styles.modernSelectedText}
              data={valueOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select value..."
              value={filterValue}
              onFocus={() => setIsValueFocus(true)}
              onBlur={() => setIsValueFocus(false)}
              onChange={item => {
                setFilterValue(item.value);
                setIsValueFocus(false);
              }}
              disable={!filterType}
            />

           
          </View>
        </View>

        {/* Tickets Section Header */}
		<View style={{flexDirection: 'row', marginBottom: 16, alignItems: "center", justifyContent: "space-between", }}>
        <View style={styles.modernSectionHeader}>
          <Text style={styles.sectionTitle}>
            Tickets {filteredTickets.length > 0 && `(${filteredTickets.length})`}
          </Text>
        </View>

		 {(filterType || filterValue || searchQuery) && (
              <TouchableOpacity style={styles.modernResetButton} onPress={resetFilters}>
                <MaterialIcons name="refresh" size={18} color={colors.textOnPrimary} />
                <Text style={styles.modernResetText}>Reset</Text>
              </TouchableOpacity>
            )}
			</View>

        {/* Modern Ticket List */}
        {filteredTickets.length > 0 ? (
          <View style={styles.modernTicketList}>
            {filteredTickets.map((ticket, index) => (
              <View key={ticket.id} style={index > 0 && styles.ticketMargin}>
                <TicketCard ticket={ticket} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.modernEmptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="inbox" size={48} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No tickets found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Modern Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  modernHeader: {
    marginBottom: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modernSearchContainer: {
    marginBottom: 18,
  },
  modernSearchBar: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  modernFilterSection: {
    marginBottom: 18,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modernFilters: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  modernDropdown: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.muted,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modernDropdownFocus: {
    borderColor: colors.primary,
  },
  modernDropdownDisabled: {
    opacity: 0.5,
  },
  modernPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modernSelectedText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  modernResetButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernResetText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  modernSectionHeader: {
    // marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modernTicketList: {
    gap: 1,
  },
  ticketMargin: {
    marginTop: 16,
  },
  modernCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
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
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
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
    color: colors.textPrimary,
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
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  modernSubTag: {
    backgroundColor: colors.primaryTransparent,
  },
  modernTagText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Demo;