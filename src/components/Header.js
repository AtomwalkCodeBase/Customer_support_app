import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const Header = ({
  ticket,
  searchText,
  onSearchChange,
  onClearSearch,
  onFilterPress,
  // onNotificationPress,
}) => {
  console.log("ticket", ticket);
  
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <Image
            style={styles.avatar}
            source={{ uri: 'https://my-office-docs.s3.amazonaws.com/media/default_user.jpg' }}
          />
          <View style={styles.userText}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{ticket.contact_name}</Text>
          </View>
        </View>
        {/* <TouchableOpacity style={styles.notificationIcon} onPress={onNotificationPress}>
          <Feather name="bell" size={24} color="white" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search.."
            value={searchText}
            onChangeText={onSearchChange}
            placeholderTextColor="#888"
          />
          {searchText ? (
            <TouchableOpacity onPress={onClearSearch}>
              <MaterialIcons name="clear" size={24} color="#888" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Feather name="mic" size={20} color="#888" style={styles.micIcon} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Feather name="sliders" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  userText: {
    marginLeft: 10,
  },
  greeting: {
    color: colors.white,
    fontSize: 14,
  },
  userName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationIcon: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  micIcon: {
    marginLeft: 10,
  },
  filterButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default Header;