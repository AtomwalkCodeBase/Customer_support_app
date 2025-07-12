import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../Styles/appStyle';
import { MaterialIcons } from '@expo/vector-icons';

const StatCard = ({ count, label, color, icon, onPress, isActive }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    disabled={!onPress}
    style={[styles.statCard, { borderColor: color, borderWidth: isActive ? 1 : 0,  }]}
  >
    {/* <View style={[styles.statCard, { borderLeftColor: color, borderWidth: isActive ? 1 : 0 }]}> */}
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statCount, { color }]}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    {/* </View> */}
  </TouchableOpacity>
);

export default StatCard

const styles = StyleSheet.create({
	statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.background,
    padding: 12,
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
})