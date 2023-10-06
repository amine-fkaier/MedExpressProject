import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AuthContext } from '../../apis/Users';
import { HeaderBackButton } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';

const StatisticsScreen = ({navigation}) => {
  const [labels, setLabels] = useState([""]);
  const [dataSets, setDataSets] = useState([0]);

  const {getOrdersPerMonth} = useContext(AuthContext);
  const isFocused = useIsFocused(); // Get the focus state using the hook
  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
          const {resultLables, resultDataSets} = await getOrdersPerMonth();
          setDataSets(resultDataSets);
          setLabels(resultLables);
      }
      fetchData()
    }
  }, [isFocused]);

  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate('Home')} />
      ),
      headerShown: true,
      drawerEnabled: false,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Commandes/Mois</Text>
      <View style={styles.pieChartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: dataSets,
              },
            ],
          }}
          width={Dimensions.get('window').width - 16} // from react-native
          height={220}
          yAxisLabel={'Rs'}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 255) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
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
