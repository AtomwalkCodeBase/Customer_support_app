import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';
import { getProfileInfo } from '../services/authServices';

const Header = ({
  profile,
  searchText,
  onSearchChange,
  onClearSearch,
  onFilterPress,
  loading = false, // New prop to control skeleton loader
}) => {
  // Shimmer animation setup
  const shimmerAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  // Calculate shimmer translation
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  if (loading) {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            {/* Skeleton for avatar */}
            <View style={[styles.avatar, styles.skeletonAvatar]}>
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslateX }],
                  },
                ]}
              />
            </View>
            <View style={styles.userText}>
              {/* Skeleton for greeting */}
              <View style={[styles.skeletonText, { width: 60, height: 14, marginBottom: 4 }]}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerTranslateX }],
                    },
                  ]}
                />
              </View>
              {/* Skeleton for username */}
              <View style={[styles.skeletonText, { width: 100, height: 16 }]}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerTranslateX }],
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
        {/* Skeleton for search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <View style={[styles.skeletonSearch, { flex: 1, height: 45 }]}>
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslateX }],
                  },
                ]}
              />
            </View>
            <View style={[styles.filterButton, styles.skeletonFilterButton]}>
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslateX }],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <Image style={styles.avatar} source={{ uri: profile?.image }} />
          <View style={styles.userText}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>
              {/* {profile?.contact_name ? profile.contact_name : profile.customer_group} */}
              {profile?.name}
            </Text>
          </View>
        </View>
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
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          {/* <Feather name="sliders" size={20} color="white" /> */}
          <AntDesign name="filter" size={24} color="white" />
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
  filterButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  // Skeleton styles
  skeletonAvatar: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonSearch: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  skeletonFilterButton: {
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 100,
    height: '100%',
  },
});

export default Header;