import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, BackHandler, FlatList} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import { IconButton, MD3Colors } from 'react-native-paper';
import 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
import { useIsFocused } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import { PatientContext } from '../../apis/patients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { PharmaciesProvider, PharmacyContext } from '../../apis/Pharmacies';
import { AuthContext } from '../../apis/Users';
import { DeliveryPersonContext } from '../../apis/DeliveryPersons'; 

const MyOrders = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
  const {getMyOrders} = useContext(PatientContext);
  const {getOrdersPerPharmacy} = useContext(PharmacyContext);
  const {getOrdersPerDeliveryPerson} = useContext(DeliveryPersonContext);
  const isFocused = useIsFocused(); // Get the focus state using the hook
  const [myOrders, setMyOrders] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate("Home")} />
      ),
      headerShown: true, // Show the header
      drawerEnabled: false, // Hide the drawer
    });
  }, [navigation]);


  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        try {
          const data = JSON.parse(await AsyncStorage.getItem("userInfo"));
          let response = [];
          if(userInfo && userInfo.user){
            if(userInfo.user.role === "patient"){
              response = await getMyOrders(data.user.userId) 
            } else if(userInfo.user.role === "pharmacy"){
              response = await getOrdersPerPharmacy(data.user.userId) 
            } else if(userInfo.user.role === "deliveryPerson") {
              response = await getOrdersPerDeliveryPerson(data.user.userId) 
            }
            response && response.success ? setMyOrders(response.data) : setMyOrders([])
          }
         
        } catch (error) {
          // Handle error if AsyncStorage or getMyOrders fails
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    } else {
      setMyOrders([])
    }
  }, [isFocused]);

  const handleDetailsPress = (item) => {
    navigation.navigate('OrderDetails', { item });
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.touchable} onPress={() => handleDetailsPress(item)}>
      <View style={styles.detailsContainer}>
        <Text style={styles.orderId}>Commande #{item._id}</Text>
        <Text style={styles.prescriptionText}>Statut de commande: {item.orderStatus}</Text>
        {item.deliveryStatus ? <Text style={styles.prescriptionText}>Statut de livraison: {item.deliveryStatus}</Text> : <View/>}
        <Text style={styles.prescriptionText}>Ordonnances: {item.prescriptions.length}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.detailsText}>Plus de détails</Text>
        <SimpleLineIcons name="arrow-right" size={18} color={styles.detailsText.color} />
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={{ flex: 1, padding: 5 }}>
      <FlatList
        data={myOrders}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
       {userInfo && userInfo.user && userInfo.user.role === "patient"?
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => navigation.navigate("NewOrder")}
          /> : <View />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 18,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  touchable: {
    backgroundColor: '#F0E2E2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  prescriptionText: {
    color: 'gray',
  },
  detailsText: {
    color: '#007AFF',
  },
});

export default MyOrders;


