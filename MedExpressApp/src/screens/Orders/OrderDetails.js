import React, { useLayoutEffect, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ToastAndroid } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { PatientContext } from '../../apis/patients';
import { AuthContext } from '../../apis/Users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PharmacyContext } from '../../apis/Pharmacies';
import {Picker} from '@react-native-picker/picker';
import { DeliveryPersonContext } from '../../apis/DeliveryPersons';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [selectedOrder, setSelectedOrder] = useState(item)
  const [selectedPharmacy, setSelectedPharmacy] = useState({});
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState({});
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState("")
  const [nearestDeliveryPersons, setNearestDeliveryPersons] = useState([]);
  const [orderComment, onChangeOrderComment] = useState('');
  const [deliveryComment, onChangeDeliveryComment] = useState('');
  const isFocused = useIsFocused();
  const { getOrderDetails, payOrder } = useContext(PatientContext);
  const { acceptOrRefuseOrder, getNearestDeliveryPersons, passOrderToDelivery, getPharmacyById } = useContext(PharmacyContext);
  const { acceptOrRefuseDeliveryOrder, finalizeOrder, getDeliveryPersonById } = useContext(DeliveryPersonContext);

  const {userInfo} = useContext(AuthContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate('MyOrders')} />
      ),
      headerShown: true,
      drawerEnabled: false,
    });
  }, [navigation]);

  
  useEffect(() => {
    if (isFocused) {
      setSelectedOrder(item)
      const fetchData = async () => {
        try {
         if (userInfo && userInfo.user.role === "pharmacy" && selectedOrder.orderStatus === "accepted"){
            const response = await getNearestDeliveryPersons(userInfo.user.userId)
            setNearestDeliveryPersons(response.data || [])
          }
          if(item && item.deliveryPersonId){
            const response = await getDeliveryPersonById(item.deliveryPersonId)
            console.log({response})
            setSelectedDeliveryPerson(response.data || [])
          }
          const selectedPharamacyData = await getPharmacyById(item.pharmacyId)
          setSelectedPharmacy(selectedPharamacyData.data || {})
        } catch (error) {
          // Handle error if AsyncStorage or getMyOrders fails
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    } else {
      setSelectedOrder({})
      onChangeOrderComment("")
      onChangeDeliveryComment("")
      setSelectedPharmacy({})
      setSelectedDeliveryPersonId("")
    }
  }, [isFocused]);


  handleRefuseOrAcceptOrder = async(response) => {
    const newOrder = await acceptOrRefuseOrder(selectedOrder._id, response, orderComment)
    setSelectedOrder(newOrder)
  }

  handlePassOrderToDelivery = async(selectedDeliveryPersonId, orderId) => {
    if(selectedDeliveryPersonId && orderId){
      const newOrder = await passOrderToDelivery(selectedDeliveryPersonId, orderId)
      setSelectedOrder(newOrder)
    } else {
      ToastAndroid.show("Il faut choisir un livreur", ToastAndroid.LONG)
    }
  }
  
  handleRefuseOrAcceptDeliveryOrder = async(response) => {
    console.log({id: selectedOrder._id, response, deliveryComment})
    const newOrder = await acceptOrRefuseDeliveryOrder(selectedOrder._id, response, deliveryComment)
    console.log({newOrder})
    setSelectedOrder(newOrder)
  }

  handleFinalizeOrder = async(orderId) => {
    const newOrder = await finalizeOrder(orderId)
    setSelectedOrder(newOrder)
  }

  
  handlePayOrder = async(orderId) => {
    const newOrder = await payOrder(orderId)
    setSelectedOrder(newOrder)
  }


  const renderPrescriptionImages = () => {
    return selectedOrder.prescriptions.map((prescription, index) => (
      <Image
        key={index}
        source={{ uri: `http://192.168.1.13:8000/${prescription}` }}
        style={styles.prescriptionImage}
      />
    ));
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.header}>Détails de la commande</Text> */}
      <Text style={styles.sectionHeader}>Commande #{selectedOrder._id}</Text>
      
      {selectedOrder && selectedOrder.prescriptions && selectedOrder.prescriptions.length ? 
      <Text style={styles.sectionHeader}>
        Nombre d'ordonnances: {selectedOrder.prescriptions.length}
      </Text> : <View/>}
      <Text style={styles.sectionHeader}>Pharmacie: {selectedPharmacy.username}</Text>
      
      {selectedOrder.deliveryPersonId ? <View><Text style={styles.sectionHeader}>Livreur: {selectedDeliveryPerson.username}</Text></View> : <View />}

      {selectedOrder && selectedOrder.orderComment ?  
      <View><Text style={styles.sectionHeader}>Commentaire (pharmacie): {selectedOrder.orderComment}</Text></View>  : <View />}

      {selectedOrder && selectedOrder.deliveryComment ?  
      <View><Text style={styles.sectionHeader}>Commentaire (livreur): {selectedOrder.deliveryComment}</Text></View> : <View />}

      {selectedOrder && selectedOrder.prescriptions?  
      
      <View><Text style={styles.sectionHeader}>Ordonnance(s):</Text> 
     { renderPrescriptionImages() }
      </View>
      : 
      
      <View />}



      {
        userInfo && userInfo.user && userInfo.user.role === "patient" && selectedOrder.orderStatus === "accepted" && 
        (selectedOrder.deliveryStatus === "pending" || !selectedOrder.deliveryStatus) && !selectedOrder.payed? 
        <View style={styles.touchableView}>
          <TouchableOpacity style={styles.acceptTouchable} onPress={() => handlePayOrder(item._id)}><Text style={styles.touchableText}>Payer</Text></TouchableOpacity>
        </View> : <View/>
      }

      {
        userInfo && userInfo.user && userInfo.user.role === "pharmacy" && selectedOrder.orderStatus === "pending" ? 
        <View>
          <View>
            <TextInput
              style={styles.input}
              onChangeText={onChangeOrderComment}
              value={orderComment}
              placeholder='Laisser une commentaire'
            />
          </View>
          <View style={styles.touchableView}>
            <TouchableOpacity style={styles.acceptTouchable} onPress={() => handleRefuseOrAcceptOrder("accepted")}><Text style={styles.touchableText}>Accepter</Text></TouchableOpacity>
            <TouchableOpacity style={styles.refuseTouchable} onPress={() => handleRefuseOrAcceptOrder("refused")}><Text style={styles.touchableText}>Refuser</Text></TouchableOpacity>
          </View> 
        </View>
        
        : <View/>
        
      }
      {
        userInfo && userInfo.user && userInfo.user.role === "pharmacy" && selectedOrder.orderStatus === "accepted" 
        &&  !selectedOrder.deliveryStatus && selectedOrder.payed? 
        <View style={styles.selectDeliveryPersonView}>
          <View style={styles.pickerView}>
            <Text>Choisir une livreur:</Text>
            <Picker
              style={styles.picker}
              selectedValue={selectedDeliveryPersonId}
              onValueChange={(itemValue, itemIndex) => setSelectedDeliveryPersonId(itemValue)}
            >
              {nearestDeliveryPersons.map((item)=> <Picker.Item key={item._id} label={item.username} value={item._id} />)}
            </Picker>
          </View>
          <View style={styles.touchableView}>
            <TouchableOpacity style={styles.acceptTouchable} onPress={() => handlePassOrderToDelivery(selectedDeliveryPersonId, item._id)}><Text style={styles.touchableText}>Confirmer</Text></TouchableOpacity>
          </View> 
        </View> : <View/>
      }

      {
        userInfo && userInfo.user && userInfo.user.role === "deliveryPerson" && selectedOrder.orderStatus === "accepted" 
        && selectedOrder.deliveryStatus && selectedOrder.deliveryStatus === "pending" ? 
        <View>
          <View>
            <TextInput
              style={styles.input}
              onChangeText={onChangeDeliveryComment}
              value={deliveryComment}
              placeholder='ecrire une commentaire'
            />
          </View>
          <View style={styles.touchableView}>
              <TouchableOpacity style={styles.acceptTouchable} onPress={() => handleRefuseOrAcceptDeliveryOrder("accepted")}><Text style={styles.touchableText}>Accepter</Text></TouchableOpacity>
              <TouchableOpacity style={styles.refuseTouchable} onPress={() => handleRefuseOrAcceptDeliveryOrder("refused")}><Text style={styles.touchableText}>Refuser</Text></TouchableOpacity>
          </View> 
        </View>
        : <View/> 
      }

      {
        userInfo && userInfo.user && userInfo.user.role === "deliveryPerson" && selectedOrder.orderStatus === "accepted" 
        && selectedOrder.deliveryStatus && selectedOrder.deliveryStatus === "accepted" ? 
        <View style={styles.touchableView}>
            <TouchableOpacity style={styles.acceptTouchable} onPress={() => handleFinalizeOrder(selectedOrder._id)}><Text style={styles.touchableText}>Finaliser commande</Text></TouchableOpacity>
          </View> : <View/>   
      }
    </ScrollView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    padding: 10
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 8,
  },
  prescriptionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 30
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  touchableView: {
    flex: 1,
    // backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptTouchable: {
    backgroundColor: "#28a745",
    justifyContent: 'center',
    width: "50%",
    padding: 5,
    margin: 5,
  },
  refuseTouchable: {
    backgroundColor: "#dc3545",
    justifyContent: 'center',
    width: "50%",
    padding: 5,
    margin: 5
  },
  touchableText: {
    alignSelf: "center"
  }
});