import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilterDropdown from '../components/FilterDropdown';
import AddTicketScreen from './AddTicketScreen';
import { getTaskCategory, getUserTasks } from '../services/productServices';
import { getCustomerId } from '../services/localStore';
import { useRouter } from 'expo-router';
import { ErrorModal } from '../components/Modals';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import EmptyState from '../components/EmptyState';
import { RefreshControl } from 'react-native';
import { colors } from '../Styles/appStyle';

export default function TicketListScreen() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const router = useRouter();

  // Fetch task categories
  const fetchTaskCategories = async () => {
    try {
      const res = await getTaskCategory();
      setCategories(res.data);
      // console.log('category', res.data);
    } catch (error) {
      console.log('Failed to fetch categories:', error);
      setErrorMessage('Failed to load categories');
      setErrorVisible(true);
    }
  };

  // Fetch user tasks
  const fetchTasks = async () => {
    try {
      const customerId = await getCustomerId();
      const res = await getUserTasks('ALL', customerId);
      // console.log('fetchTasks response:', res.data);
      setTickets(res.data);
    } catch (error) {
      console.log('Failed to fetch tasks:', error.message);
      setErrorMessage('Failed to load tasks');
      setErrorVisible(true);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchTaskCategories();
    fetchTasks();
  }, []);

  // Handle category selection from dropdown
  const handleCategorySelect = (category) => {
    console.log('Selected category:', category);
    setSelectedCategory(category);
    setShowDropdown(false);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchText('');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
    setShowDropdown(false);
  };

  // Categories for FilterDropdown (only e_type === 'TASK')
  const filterCategories = [
    ...categories.filter((cat) => cat.e_type === 'TASK'),
  ];

  // Filter tickets based on search text and selected category
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      searchText === '' ||
      (ticket.task_ref_id &&
        ticket.task_ref_id.toLowerCase().includes(searchText.toLowerCase())) ||
      (ticket.remarks &&
        ticket.remarks.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory =
      !selectedCategory ||
      selectedCategory.id === 'all' ||
      (ticket.task_category_id &&
        ticket.task_category_id.toString() === selectedCategory.id.toString());

    return matchesSearch && matchesCategory;
  });

  // Handle ticket creation or update
  const handleSaveTicket = async (ticketData) => {
    try {
      if (isEditMode && selectedTicket) {
        setTickets(
          tickets.map((ticket) =>
            ticket.id === selectedTicket.id ? { ...ticket, ...ticketData } : ticket
          )
        );
      } else {
        setTickets([...tickets, { ...ticketData, id: ticketData.tempId || ticketData.id }]);
      }
      setModalVisible(false);
      setSelectedTicket(null);
      setIsEditMode(false);

      await fetchTasks();
    } catch (error) {
      console.log('Error in handleSaveTicket:', error);
      setErrorMessage('Failed to save ticket');
      setErrorVisible(true);
    }
  };

  // Handle edit ticket
  const handleEditTicket = (ticket) => {
    const mappedTicket = {
      id: ticket.id,
      remarks: ticket.remarks || '',
      image: ticket.image || null,
      task_category_id: ticket.task_category_id || null,
      task_sub_category_id: ticket.task_sub_category_id || null,
    };
    setSelectedTicket(mappedTicket);
    setIsEditMode(true);
    setModalVisible(true);
  };

  // Navigate to ticket detail screen
  const handleViewTicket = (ticket) => {
    router.push({
      pathname: 'TicketDetailScreen',
      params: { params: JSON.stringify(ticket) },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTasks();
    } catch (error) {
      setErrorMessage('Failed to refresh tasks');
      setErrorVisible(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <FilterDropdown
          visible={showDropdown}
          onClose={() => setShowDropdown(false)}
          title="Select Category"
          options={filterCategories}
          onSelect={handleCategorySelect}
          onClear={handleClearFilters}
        />

        <Header
          ticket={tickets}
          searchText={searchText}
          onSearchChange={setSearchText}
          onClearSearch={handleClearSearch}
          onFilterPress={() => setShowDropdown(true)}
          // onNotificationPress={() => console.log('Notification pressed')}
        />

        <Text style={styles.listTitle}>List of Tickets</Text>

        {filteredTickets.length > 0 ? (
          <ScrollView
            style={styles.ticketsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id || ticket.tempId}
                ticket={ticket}
                onPress={() => handleViewTicket(ticket)}
                onEdit={handleEditTicket}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            hasFilters={searchText || selectedCategory}
            onCreatePress={() => {
              setSelectedTicket(null);
              setIsEditMode(false);
              setModalVisible(true);
            }}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedTicket(null);
            setIsEditMode(false);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={colors.white} />
          <Text style={styles.addButtonText}>Create New Ticket</Text>
        </TouchableOpacity>

        <AddTicketScreen
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedTicket(null);
            setIsEditMode(false);
          }}
          onSave={handleSaveTicket}
          ticket={selectedTicket}
          isEditMode={isEditMode}
        />
      </SafeAreaView>

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  ticketsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
