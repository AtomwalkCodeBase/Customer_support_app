import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "../Styles/appStyle";

const FilterBar = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterValue,
  setFilterValue,
  filterOptions,
  valueOptions,
  isFilterFocus,
  setIsFilterFocus,
  isValueFocus,
  setIsValueFocus,
  resetFilters,
}) => (
  <>
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
          <TouchableOpacity onPress={() => setSearchQuery("")}> 
            <AntDesign name="closecircleo" size={20} color={colors.textSecondary} />
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
              color={isFilterFocus ? colors.primary : colors.textSecondary}
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
    {(filterType || filterValue || searchQuery) && (
      <TouchableOpacity style={styles.modernResetButton} onPress={resetFilters}>
        {/* <MaterialIcons name="refresh" size={18} color={colors.textOnPrimary} /> */}
        <Feather name="x" size={18} color={colors.textOnPrimary} />
        <Text style={styles.modernResetText}>Clear Filter</Text>
      </TouchableOpacity>
    )}
  </>
);

const styles = StyleSheet.create({
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
    gap: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modernResetText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default FilterBar; 