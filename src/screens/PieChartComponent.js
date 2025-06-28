import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
// import { PieChart } from 'react-native-chart-kit';

const colors = {
  // Brand & Primary
  primary: '#FF6B6B',
  primaryTransparent: '#ff550033',

  // Text
  textPrimary: '#333',
  textSecondary: '#777E90',
  textOnPrimary: '#FFFFFF',

  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#F5F5F5',
  backgroundDarker: '#1E1E1E',

  // Borders & Divider
  border: '#9B9B9A',

  // Status
  error: '#ED1010',
  success: 'green',
  warning: '#FFC300',
  muted: '#eee',

  // Utility
  black: '#000000',
  white: '#FFFFFF',
};

const screenWidth = Dimensions.get('window').width;

const PieChartComponent = () => {
  // Sample data - replace with your actual data
  const data = [
    {
      name: 'SLA Meet',
      population: 35,
      color: colors.primary,
      legendFontColor: colors.textPrimary,
      legendFontSize: 15,
    },
    {
      name: 'SLA does not Meet',
      population: 25,
      color: colors.success,
      legendFontColor: colors.textPrimary,
      legendFontSize: 15,
    },
    // {
    //   name: 'Category C',
    //   population: 80,
    //   color: colors.warning,
    //   legendFontColor: colors.textPrimary,
    //   legendFontSize: 15,
    // },
    // {
    //   name: 'Category D',
    //   population: 15,
    //   color: colors.error,
    //   legendFontColor: colors.textPrimary,
    //   legendFontSize: 15,
    // },
    // {
    //   name: 'Others',
    //   population: 5,
    //   color: colors.border,
    //   legendFontColor: colors.textPrimary,
    //   legendFontSize: 15,
    // },
  ];

  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SLA Dashboard</Text>
      
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
        hasLegend={false}
      />
      
      {/* Custom Legend */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name}: {item.population}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
});

export default PieChartComponent;