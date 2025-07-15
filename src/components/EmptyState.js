import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const EmptyState = ({ hasFilters, onCreatePress }) => {

  console.log("hasFilters", hasFilters)
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color="#FF6B6B" />
      <Text style={styles.emptyText}>
        {hasFilters ? 'No Matching Tickets' : 'No Tickets Available'}
      </Text>
      <Text style={styles.emptySubText}>
        {hasFilters
          ? 'Try adjusting your filters'
          : 'Create your first ticket by clicking the button below'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default EmptyState;