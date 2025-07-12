import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { TaskContext } from "../../context/TaskContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../Styles/appStyle";
import AddTicketScreen from "./AddTicketScreen";
import EditTicketScreen from "./EditTicketScreen";
import { ErrorModal, Loader } from "../components/Modals";
import FilterBar from "../components/FilterBar";
import TicketList from "../components/TicketList";
import { getCustomerDetailList } from "../services/productServices";
import { getFilterOptions, filterTickets } from "../utils/filterUtils";

export default function TicketListScreen() {
  const { tickets, setTickets, categories, loadings, setLoading, error, setError, fetchTasks, fetchTaskCategories, clearError} = useContext(TaskContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [isError, setisError] = useState({ visible: false, message: "" });
  const [profile, setProfile] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterValue, setFilterValue] = useState(null);
  const [isFilterFocus, setIsFilterFocus] = useState(false);
  const [isValueFocus, setIsValueFocus] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);

  const router = useRouter();

  useEffect(() => {
    fetchTaskCategories();
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setisLoading(true);
        const customerId = await AsyncStorage.getItem("Customer_id");
        const res = await getCustomerDetailList(customerId);
        const customer = res.data.find(
          (item) => item.id?.toString() === customerId?.toString()
        );
        setProfile(customer || {});
        await AsyncStorage.setItem("profilename", customer.name);
      } catch (error) {
        setisError({
          visible: true,
          message: "Failed to load Customer Details",
        });
      } finally {
        setisLoading(false);
      }
    };
    fetchTaskCategories();
    fetchCustomerDetails();
  }, []);

  // StatCard config for DRY rendering
  const statCardsConfig = [
    {
      count: tickets.filter((t) => t.task_status === "Completed").length,
      label: "Completed",
      color: "#008000",
      icon: "check-circle-outline",
      status: "Completed",
    },
    {
      count: tickets.filter((t) => t.task_status === "Planned").length,
      label: "Planned",
      color: "#2196F3",
      icon: "schedule",
      status: "Planned",
    },
    {
      count: tickets.filter((t) => t.task_status === "Not Planned").length,
      label: "Not Planned",
      color: "#FF9500",
      icon: "event-busy",
      status: "Not Planned",
    },
    {
      count: tickets.filter((t) => t.task_status === "On Hold").length,
      label: "On Hold",
      color: colors.error,
      icon: "pause-circle-outline",
      status: "On Hold",
    },
  ];

  // Filter options
  const filterOptions = [
    { label: "Category", value: "category" },
    { label: "Sub Category", value: "subcategory" },
    { label: "Status", value: "status" },
    { label: "Year", value: "year" },
    { label: "Month", value: "month" },
  ];

  // Value options for the second dropdown
  const valueOptions = getFilterOptions(filterType, categories, tickets);

  // Filter tickets using utility
  useEffect(() => {
    setFilteredTickets(
      filterTickets(tickets, searchQuery, filterType, filterValue)
    );
  }, [tickets, searchQuery, filterType, filterValue]);

  const resetFilters = () => {
    setFilterType(null);
    setFilterValue(null);
    setSearchQuery("");
  };

  // Handle ticket creation or update
  const handleSaveTicket = async (ticketData) => {
    try {
      if (isEditMode && selectedTicket) {
        setTickets(
          tickets.map((ticket) =>
            ticket.id === selectedTicket.id
              ? { ...ticket, ...ticketData }
              : ticket
          )
        );
        setSearchQuery(ticketData.remarks || "");
      } else {
        setTickets([
          ...tickets,
          { ...ticketData, id: ticketData.tempId || ticketData.id },
        ]);
      }
      setModalVisible(false);
      setSelectedTicket(null);
      setIsEditMode(false);
      await fetchTasks();
    } catch (error) {
      setError({ visible: true, message: "Failed to save ticket" });
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
      pathname: "TicketDetailScreen",
      params: { params: JSON.stringify(ticket) },
    });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Header profile={profile || {}} />
        <ScrollView style={{ marginHorizontal: 16, marginTop: 20 }} showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            {statCardsConfig.map((card) => (
              <StatCard
                key={card.label}
                count={card.count}
                label={card.label}
                color={card.color}
                icon={card.icon}
                onPress={() => {
                  setFilterType("status");
                  setFilterValue(card.status);
                }}
                isActive={filterType === "status" && filterValue === card.status}
              />
            ))}
          </View>

          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            filterOptions={filterOptions}
            valueOptions={valueOptions}
            isFilterFocus={isFilterFocus}
            setIsFilterFocus={setIsFilterFocus}
            isValueFocus={isValueFocus}
            setIsValueFocus={setIsValueFocus}
            resetFilters={resetFilters}
          />

          <View style={{ flexDirection: "row", marginBottom: 16, alignItems: "center", justifyContent: "space-between" }}>
            <View style={styles.modernSectionHeader}>
              <Text style={styles.sectionTitle}>
                Tickets {filteredTickets.length > 0 && `(${filteredTickets.length})`}
              </Text>
            </View>
          </View>

          <TicketList
            tickets={filteredTickets}
            onView={handleViewTicket}
            onEdit={handleEditTicket}
            onCreate={() => {
              setSelectedTicket(null);
              setIsEditMode(false);
              setModalVisible(true);
            }}
          />
        </ScrollView>

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

      <ErrorModal visible={error.visible} message={error.message} onClose={clearError} />
      <Loader
        visible={loadings || refreshing}
        message={loadings ? "Loading tickets..." : refreshing ? "Refreshing tickets..." : ""}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  modernSectionHeader: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    flexDirection: "row",
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
