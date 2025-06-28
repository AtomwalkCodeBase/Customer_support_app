import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import FilterDropdown from "../components/FilterDropdown";
import AddTicketScreen from "./AddTicketScreen";
import { useRouter } from "expo-router";
import { ErrorModal, Loader } from "../components/Modals";
import Header from "../components/Header";
import TicketCard from "../components/TicketCard";
import EmptyState from "../components/EmptyState";
import { RefreshControl } from "react-native";
// import { colors } from '../Styles/appStyle';
import EditTicketScreen from "./EditTicketScreen";
import { TaskContext } from "../../context/TaskContext";
import { getCustomerDetailList } from "../services/productServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatCard from "../components/StatCard";
import { colors } from "../Styles/appStyle";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
// import { TaskContext } from '../context/TaskContext';

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
  const [valueOptions, setValueOptions] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const[taskloader,setTaskloader]=useState(true)
console.log(loadings,"tickets")
  const router = useRouter();

  const { performance } = global;

  useEffect(() => {
    fetchTaskCategories();
    fetchTasks();
  }, []);

  // console.log("ticklts",categories)

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
        // console.log("data", customer.name );
        await AsyncStorage.setItem("profilename", customer.name);
      } catch (error) {
        console.log("Failed to fetch Customer Details:", error.message);
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

  const getStatusStats = (tickets) => {
    const stats = {
      planned: 0,
      completed: 0,
      notPlanned: 0,
      onHold: 0,
    };

    tickets.forEach((ticket) => {
      const status = ticket.task_status?.toLowerCase();

      if (status === "planned") stats.planned += 1;
      else if (status === "completed") stats.completed += 1;
      else if (status === "not planned") stats.notPlanned += 1;
      else if (status === "on hold") stats.onHold += 1;
    });

    return stats;
  };

  const stats = getStatusStats(tickets);

  const filterOptions = [
    { label: "Category", value: "category" },
    { label: "Sub Category", value: "subcategory" },
    { label: "Status", value: "status" },
    { label: "Year", value: "year" },
    { label: "Month", value: "month" },
  ];

  useEffect(() => {
    if (!filterType) return;

    if (filterType === "category") {
      const catList = categories
        .filter((item) => item.e_type === "TASK")
        .map((cat) => ({
          label: cat.name,
          value: cat.name,
        }));
      setValueOptions(catList);
    }

    if (filterType === "subcategory") {
      const subCatList = categories
        .filter((item) => item.e_type === "T_SUB")
        .map((sub) => ({
          label: sub.name,
          value: sub.name,
        }));
      setValueOptions(subCatList);
    }

    if (filterType === "status") {
      const uniqueStatuses = Array.from(
        new Set(tickets.map((t) => t.task_status))
      );
      const statusOptions = uniqueStatuses.map((status) => ({
        label: status,
        value: status,
      }));
      setValueOptions(statusOptions);
    }

    if (filterType === "year") {
      const years = Array.from(
        new Set(
          tickets.map((t) => {
            let year;
            if (t.task_date) {
              // Parse "DD-MM-YYYY"
              const parts = t.task_date.split("-");
              year =
                parts.length === 3
                  ? parts[2]
                  : new Date(t.createdAt).getFullYear().toString();
            } else {
              year = new Date(t.createdAt).getFullYear().toString();
            }
            return year;
          })
        )
      );
      const yearOptions = years.map((year) => ({
        label: year.toString(),
        value: year.toString(),
      }));
      setValueOptions(yearOptions);
    }

    if (filterType === "month") {
      const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
      ];
      const monthOptions = months.map((month, idx) => ({
        label: month,
        value: (idx + 1).toString().padStart(2, "0"), // e.g., "01"
      }));
      setValueOptions(monthOptions);
    }
  }, [filterType, categories, tickets]);

  // Filter tickets based on search and filters
  const searchKeys = ["remarks", "task_ref_id", "task_status"];
  useEffect(() => {
    const startTime = performance.now();
    let filtered = [...tickets];

    // Search by keyword in remarks, task_ref_id, task_status
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        searchKeys.some((key) =>
          item[key]?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category, subcategory, or status
    if (filterType && filterValue) {
      if (filterType === "category") {
        filtered = filtered.filter(
          (item) => item.task_category_name === filterValue
        );
      } else if (filterType === 'subcategory') {
        filtered = filtered.filter(item =>
          item.task_sub_category_name === filterValue
        );
      } else if (filterType === 'status') {
        filtered = filtered.filter(item =>
          item.task_status === filterValue
        );
      }else if (filterType === "year") {
        filtered = filtered.filter((item) => {
          let year;
          if (item.task_date) {
            // Parse "DD-MM-YYYY"
            const parts = item.task_date.split("-");
            year =
              parts.length === 3
                ? parts[2]
                : new Date(item.createdAt).getFullYear().toString();
          } else {
            year = new Date(item.createdAt).getFullYear().toString();
          }
          return year === filterValue;
        });
      } else if (filterType === "month") {
        filtered = filtered.filter((item) => {
          let month;
          if (item.task_date) {
            // Parse "DD-MM-YYYY"
            const parts = item.task_date.split("-");
            month =
              parts.length === 3
                ? parts[1]
                : (new Date(item.createdAt).getMonth() + 1)
                    .toString()
                    .padStart(2, "0");
          } else {
            month = (new Date(item.createdAt).getMonth() + 1)
              .toString()
              .padStart(2, "0");
          }
          return month === filterValue;
        });
      }
      // const month = (new Date(item.task_date || item.createdAt).getMonth() + 1)
      //   .toString()
      //   .padStart(2, '0'); // "01", "02", etc.
      // return month === filterValue;
    }
      const endTime = performance.now();
  console.log(`⏱️ Filtered ${filtered.length} items in ${(endTime - startTime).toFixed(2)} ms`);
    setFilteredTickets(filtered);
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
      } else {
        setTickets([
          ...tickets,
          { ...ticketData, id: ticketData.tempId || ticketData.id },
        ]);
      }
      setModalVisible(false);
      setSelectedTicket(null);
      setIsEditMode(false);

      await fetchTasks(); // Refresh tasks after saving
    } catch (error) {
      console.log("Error in handleSaveTicket:", error);
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
        <ScrollView
          style={{ marginHorizontal: 16, marginTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsGrid}>
            <StatCard
              count={stats.completed}
              label="Completed"
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
              count={stats.onHold}
              label="On Hold"
              color={colors.error}
              icon="pause-circle-outline"
            />
          </View>

          {/* Modern Search Bar */}
          <View style={styles.modernSearchContainer}>
            <View style={styles.modernSearchBar}>
              <MaterialIcons
                name="search"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.modernSearchInput}
                placeholder="Search tickets or ID..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialIcons
                    name="clear"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Modern Filter Section */}
          <View style={styles.modernFilterSection}>
            <Text style={styles.filterTitle}>Filters</Text>
            <View style={styles.modernFilters}>
              <Dropdown
                style={[
                  styles.modernDropdown,
                  isFilterFocus && styles.modernDropdownFocus,
                ]}
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
                onChange={(item) => {
                  setFilterType(item.value);
                  setFilterValue(null);
                  setIsFilterFocus(false);
                }}
                renderLeftIcon={() => (
                  <MaterialIcons
                    name="filter-list"
                    size={18}
                    color={
                      isFilterFocus ? colors.primary : colors.textSecondary
                    }
                  />
                )}
              />

              <Dropdown
                style={[
                  styles.modernDropdown,
                  isValueFocus && styles.modernDropdownFocus,
                  !filterType && styles.modernDropdownDisabled,
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
                onChange={(item) => {
                  setFilterValue(item.value);
                  setIsValueFocus(false);
                }}
                disable={!filterType}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={styles.modernSectionHeader}>
              <Text style={styles.sectionTitle}>
                Tickets{" "}
                {filteredTickets.length > 0 && `(${filteredTickets.length})`}
              </Text>
            </View>

            {(filterType || filterValue || searchQuery) && (
              <TouchableOpacity
                style={styles.modernResetButton}
                onPress={resetFilters}
              >
                <MaterialIcons
                  name="refresh"
                  size={18}
                  color={colors.textOnPrimary}
                />
                <Text style={styles.modernResetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Modern Ticket List */}
          {filteredTickets.length > 0 ? (
            <View style={styles.modernTicketList}>
              {filteredTickets.map((ticket, index) => (
                <View key={ticket.id} style={index > 0 && styles.ticketMargin}>
                  <TicketCard
                    ticket={ticket}
                    onPress={() => handleViewTicket(ticket)}
                    onEdit={handleEditTicket}
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              hasFilters={searchQuery || filterValue}
              onCreatePress={() => {
                setSelectedTicket(null);
                setIsEditMode(false);
                setModalVisible(true);
              }}
            />
          )}
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

      <ErrorModal
        visible={error.visible}
        message={error.message}
        onClose={clearError}
      />
      <Loader
        visible={loadings || refreshing}
        message={
          loadings
            ? "Loading tickets..."
            : refreshing
            ? "Refreshing tickets..."
            : ""
        }
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
  modernSearchContainer: {
    marginBottom: 18,
    padding: 2,
  },
  modernSearchBar: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modernFilters: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
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
    fontWeight: "500",
  },
  modernResetButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernResetText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  modernTicketList: {
    gap: 1,
  },
  ticketMargin: {
    marginTop: 16,
  },
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
