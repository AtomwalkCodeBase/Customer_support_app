import React, { useEffect, useState, useContext, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { ErrorModal, Loader } from '../components/Modals';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import EmptyState from '../components/EmptyState';
import { RefreshControl } from 'react-native';
import { colors } from '../Styles/appStyle';
import EditTicketScreen from './EditTicketScreen';
import { TaskContext } from '../../context/TaskContext';
import { getCustomerDetailList } from '../services/productServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { TaskContext } from '../context/TaskContext';

export default function TicketListScreen() {
  const { categories, tickets, setTickets, loading, setLoading, error, setError, fetchTaskCategories, fetchTasks, clearError } = useContext(TaskContext);

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [isError, setisError] = useState({ visible: false, message: '' });
  const [profile, setProfile] = useState({});
  const [taskLoder,setTaskloder]=useState(true)

  const router = useRouter();

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchTaskCategories(), fetchTasks()]);
      } catch (error) {
        console.log('Failed to load initial data:', error);
      }
    };
    loadData();
  }, [fetchTaskCategories, fetchTasks]);

useEffect(() => {
  const fetchCustomerDetails = async () => {
    try {
      setisLoading(true);
      const customerId = await AsyncStorage.getItem('Customer_id');
      const res = await getCustomerDetailList(customerId);
      const customer = res.data.find(
        (item) => item.id?.toString() === customerId?.toString()
      );
      setProfile(customer || {});
      // console.log("data", customer.name );
      await AsyncStorage.setItem('profilename', customer.name);
      

    } catch (error) {
      console.log('Failed to fetch Customer Details:', error.message);
      setisError({ visible: true, message: 'Failed to load Customer Details' });
    } finally {
      setisLoading(false);
    }
  };

  fetchCustomerDetails();
}, []);


  // Handle category selection from dropdown
  const handleCategorySelect = (category) => {
    // console.log('Selected category:', category);
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
const filteredTickets = useMemo(() => {
  // If no filters are applied (no searchText and no selectedCategory), return all tickets
  if (!searchText && !selectedCategory) {
    return tickets;
  }

  // Apply filtering when either searchText or selectedCategory is present
  return tickets.filter((ticket) => {
    const matchesSearch =
      !searchText ||
      (ticket.task_ref_id &&
        ticket.task_ref_id.toLowerCase().includes(searchText.toLowerCase())) ||
      (ticket.remarks &&
        ticket.remarks.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory =
      !selectedCategory ||
      selectedCategory.id === 'all' ||
      (ticket.task_category_name &&
        ticket.task_category_name === selectedCategory.name);
    return matchesSearch && matchesCategory;
  });
}, [tickets, searchText, selectedCategory]);

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

      await fetchTasks(); // Refresh tasks after saving
    } catch (error) {
      console.log('Error in handleSaveTicket:', error);
      setError({ visible: true, message: 'Failed to save ticket' });
    }
  };

  // Handle edit ticket
  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
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
      console.log('Failed to refresh tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(()=>{
 if(filteredTickets){
  setTaskloder(false)
 }
  },[filteredTickets]) 
    
  

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
          profile={profile || {}}
          searchText={searchText}
          onSearchChange={setSearchText}
          onClearSearch={handleClearSearch}
          onFilterPress={() => setShowDropdown(true)}
          loading={isLoading}
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

        {isEditMode && selectedTicket ? (
          <EditTicketScreen
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setSelectedTicket(null);
              setIsEditMode(false);
            }}
            onSave={handleSaveTicket}
            ticket={selectedTicket}
          />
        ) : (
          <AddTicketScreen
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setSelectedTicket(null);
              setIsEditMode(false);
            }}
            onSave={handleSaveTicket}
          />
        )}
      </SafeAreaView>

      <ErrorModal
        visible={error.visible}
        message={error.message}
        onClose={clearError}
      />
      <Loader visible={taskLoder} message={refreshing ? 'Refreshing tickets...' : 'Loading tickets...'} />
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
    marginVertical: 5,
    flexDirection: 'row',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});