import React, { useLayoutEffect, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
} from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { PatientContext } from '../../apis/patients';
import { AuthContext } from '../../apis/Users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PharmacyContext } from '../../apis/Pharmacies';
import { Picker } from '@react-native-picker/picker';
import { DeliveryPersonContext } from '../../apis/DeliveryPersons';
import { localServer } from '../../config/config';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [selectedOrder, setSelectedOrder] = useState(item);
  const [selectedPharmacy, setSelectedPharmacy] = useState({});
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState({});
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');
  const [nearestDeliveryPersons, setNearestDeliveryPersons] = useState([]);
  const [orderComment, onChangeOrderComment] = useState('');
  const [deliveryComment, onChangeDeliveryComment] = useState('');
  const isFocused = useIsFocused();
  const { getOrderDetails, payOrder } = useContext(PatientContext);
  const {
    acceptOrRefuseOrder,
    getNearestDeliveryPersons,
    passOrderToDelivery,
    getPharmacyById,
  } = useContext(PharmacyContext);
  const {
    acceptOrRefuseDeliveryOrder,
    finalizeOrder,
    getDeliveryPersonById,
  } = useContext(DeliveryPersonContext);

  const { userInfo } = useContext(AuthContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate('MyOrders')} />
      ),
      headerShown: true,
      drawerEnabled: false,
    });
  }, [navigation]);

  const fetchData = async () => {
    console.log({selectedOrder})
    try {
      if (
        userInfo &&
        userInfo.user.role === 'pharmacy' &&
        userInfo.user.userId &&
        selectedOrder.orderStatus === 'accepted' &&
        selectedOrder.payed
      ) {
        const response = await getNearestDeliveryPersons(
          userInfo.user.userId
        );
        if(response && response.success){
          setNearestDeliveryPersons(response.data || []);
          if (response && response.data && response.data[0] && response.data[0]._id) {
            setSelectedDeliveryPersonId(response.data[0]._id);
          }
        } else {
          console.log("error: getNearestDeliveryPersons")
        }
      }

      if (item && item.deliveryPersonId) {
        const response = await getDeliveryPersonById(item.deliveryPersonId);
        if(response && response.success){
          setSelectedDeliveryPerson(response.data || []);
        } else {
          console.log("error: getDeliveryPersonById")
        }
      }

      if (item && item.pharmacyId) {
        const selectedPharamacyData = await getPharmacyById(item.pharmacyId);
        if(selectedPharamacyData && selectedPharamacyData.success){
          setSelectedPharmacy(selectedPharamacyData.data || {});
        } else {
          console.log("error: getPharmacyById")
        }
      }
      
      if(item && item._id){
        const thisOrder = await getOrderDetails(item._id);
        if(thisOrder && thisOrder.success){
          setSelectedOrder(thisOrder.data || {});
        } else {
          console.log("error: getOrderDetails")
        }
      }


    } catch (error) {
      // Handle error if AsyncStorage or getMyOrders fails
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setSelectedOrder(item);
      fetchData();
    } else {
      setSelectedOrder({});
      onChangeOrderComment('');
      onChangeDeliveryComment('');
      setSelectedPharmacy({});
      setSelectedDeliveryPersonId('');
    }
  }, [isFocused]);

  const renderPrescriptionImages = () => {
    return selectedOrder.prescriptions.map((prescription, index) => (
      <Image
        key={index}
        source={{ uri: `${localServer}/${prescription}` }}
        style={styles.prescriptionImage}
      />
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>Commande #{selectedOrder._id}</Text>

      {selectedOrder && selectedOrder.prescriptions && selectedOrder.prescriptions.length ? (
        <Text style={styles.sectionHeader}>
          Nombre d'ordonnances: {selectedOrder.prescriptions.length}
        </Text>
      ) : (
        <View />
      )}
      <Text style={styles.sectionHeader}>Pharmacie: {selectedPharmacy.username}</Text>

      {selectedOrder.deliveryPersonId ? (
        <Text style={styles.sectionHeader}>Livreur: {selectedDeliveryPerson.username}</Text>
      ) : (
        <View />
      )}

      {selectedOrder && selectedOrder.orderStatus ? (
        <Text style={styles.sectionHeader}>Status de commande: {selectedOrder.orderStatus}</Text>
      ) : (
        <View />
      )}

      {selectedOrder && selectedOrder.deliveryStatus ? (
        <Text style={styles.sectionHeader}>Status de livraison: {selectedOrder.deliveryStatus}</Text>
      ) : (
        <View />
      )}

      {selectedOrder && selectedOrder.orderComment ? (
        <Text style={styles.sectionHeader}>Commentaire (pharmacie): {selectedOrder.orderComment}</Text>
      ) : (
        <View />
      )}

      {selectedOrder && selectedOrder.deliveryComment ? (
        <Text style={styles.sectionHeader}>Commentaire (livreur): {selectedOrder.deliveryComment}</Text>
      ) : (
        <View />
      )}

      {selectedOrder && selectedOrder.prescriptions ? (
        <View>
          <Text style={styles.sectionHeader}>Ordonnance(s):</Text>
          {renderPrescriptionImages()}
        </View>
      ) : (
        <View />
      )}

      {userInfo &&
        userInfo.user &&
        userInfo.user.role === 'patient' &&
        selectedOrder.orderStatus === 'accepted' &&
        (selectedOrder.deliveryStatus === 'pending' || !selectedOrder.deliveryStatus) &&
        !selectedOrder.payed ? (
        <View style={styles.touchableView}>
          <TouchableOpacity
            style={styles.acceptTouchable}
            onPress={() => {
              payOrder(item._id)
              fetchData()
            }}
          >
            <Text style={styles.touchableText}>Payer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View />
      )}

      {userInfo &&
        userInfo.user &&
        userInfo.user.role === 'pharmacy' &&
        selectedOrder.orderStatus === 'pending' ? (
        <View>
          <View>
            <TextInput
              style={styles.input}
              onChangeText={onChangeOrderComment}
              value={orderComment}
              placeholder='Laisser un commentaire'
            />
          </View>
          <View style={styles.touchableView}>
            <TouchableOpacity
              style={styles.acceptTouchable}
              onPress={() =>{ 
                acceptOrRefuseOrder(item._id, 'accepted', orderComment)
                fetchData()
              }}
            >
              <Text style={styles.touchableText}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.refuseTouchable}
              onPress={() => {
                acceptOrRefuseOrder(item._id, 'refused', orderComment)
                fetchData()
              }}
            >
              <Text style={styles.touchableText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View />
      )}

      {userInfo &&
        userInfo.user &&
        userInfo.user.role === 'pharmacy' &&
        selectedOrder.orderStatus === 'accepted' &&
        !selectedOrder.deliveryStatus &&
        selectedOrder.payed ? (
        <View style={styles.selectDeliveryPersonView}>
          <View style={styles.pickerView}> 
            <Text>Choisir un livreur:</Text>
            <Picker
              style={styles.picker}
              selectedValue={selectedDeliveryPersonId}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedDeliveryPersonId(itemValue)
              }
            >
              {nearestDeliveryPersons.map((item) => (
                <Picker.Item
                  key={item._id}
                  label={item.username}
                  value={item._id}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.touchableView}>
            <TouchableOpacity
              style={styles.acceptTouchable}
              onPress={() => {
                passOrderToDelivery(selectedDeliveryPersonId, item._id)
                fetchData()
              }}
            >
              <Text style={styles.touchableText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View />
      )}

      {userInfo &&
        userInfo.user &&
        userInfo.user.role === 'deliveryPerson' &&
        selectedOrder.orderStatus === 'accepted' &&
        selectedOrder.deliveryStatus &&
        selectedOrder.deliveryStatus === 'pending' ? (
        <View>
          <View>
            <TextInput
              style={styles.input}
              onChangeText={onChangeDeliveryComment}
              value={deliveryComment}
              placeholder='Écrire un commentaire'
            />
          </View>
          <View style={styles.touchableView}>
            <TouchableOpacity
              style={styles.acceptTouchable}
              onPress={() => {
                acceptOrRefuseDeliveryOrder(item._id, 'accepted', deliveryComment)
                fetchData()
              }}
            >
              <Text style={styles.touchableText}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.refuseTouchable}
              onPress={() => {
                acceptOrRefuseDeliveryOrder(item._id, 'refused', deliveryComment)
                fetchData()
              }}
            >
              <Text style={styles.touchableText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View />
      )}

      {userInfo &&
        userInfo.user &&
        userInfo.user.role === 'deliveryPerson' &&
        selectedOrder.orderStatus === 'accepted' &&
        selectedOrder.deliveryStatus &&
        selectedOrder.deliveryStatus === 'accepted' ? (
        <View style={styles.touchableView}>
          <TouchableOpacity
            style={styles.acceptTouchable}
            onPress={() => {
              finalizeOrder(selectedOrder._id)
              fetchData()
            }}
          >
            <Text style={styles.touchableText}>Finaliser commande</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View />
      )}
    </ScrollView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    padding: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  prescriptionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
  },
  touchableView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  acceptTouchable: {
    backgroundColor: '#28a745',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  refuseTouchable: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  touchableText: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectDeliveryPersonView: {
    marginTop: 20,
  },
  pickerView: {
    marginBottom: 10,
  },
  picker: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
