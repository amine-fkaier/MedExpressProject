import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

// Dummy data for orders per month (replace with your actual data)
const ordersData = [
  { month: 'January', orders: 50 },
  { month: 'February', orders: 75 },
  { month: 'March', orders: 60 },
  // Add more months and order data as needed
];

const StatisticsScreen = () => {
  const [monthlyOrders, setMonthlyOrders] = useState([]);

  useEffect(() => {
    // Fetch your orders data here and update monthlyOrders state with actual data
    setMonthlyOrders(ordersData);
  }, []);

  // Data for the pie chart
  const chartData = monthlyOrders.map((item) => ({
    name: item.month,
    orders: item.orders,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`, // Change the chart's color here
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.month}>{item.month}</Text>
      <Text style={styles.orderCount}>{item.orders} Orders</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Orders Per Month</Text>

      <FlatList
        data={monthlyOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.month}
      />

      <View style={styles.pieChartContainer}>
        <PieChart
          data={chartData}
          width={300}
          height={200}
          chartConfig={chartConfig}
          accessor="orders"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </View>
  );
};

export default StatisticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  month: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderCount: {
    fontSize: 18,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
