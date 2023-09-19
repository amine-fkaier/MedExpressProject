import React, {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, BackHandler, FlatList, Alert, PermissionsAndroid,  TouchableOpacity } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { useIsFocused } from '@react-navigation/native';
import {AuthContext} from '../../apis/Users.js'
import { PatientContext } from '../../apis/patients.js';
import { PharmacyContext } from '../../apis/Pharmacies.js';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';


const HomeScreen = ({navigation}) => {
  const {userInfo, isLoading, logout, saveFcmToken, getAllUsers} = useContext(AuthContext);
  const {getNearestPharmacies} = useContext(PatientContext);
  const {getNearestDeliveryPersons} = useContext(PharmacyContext);
  const isFocused = useIsFocused(); // Get the focus state using the hook
  const [nearestPharmacies, setNearestPharmacies] = useState([]);
  const [nearestDeliveryPersons, setNearestDeliveryPersons] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

 

  const firebaseConfig = {
    clientId: '999480160094-ufud7u260bb2f16vcqkqr5u17t9p8bho.apps.googleusercontent.com',
    appId: '1:999480160094:android:2eb5521fa7e49cdee2e9cf',
    apiKey: 'AIzaSyCmASj6dq575ytAHDJIqmJU3mZGYQswqkk',
    databaseURL: 'https://med-express-99faa-default-rtdb.firebaseio.com',
    storageBucket: 'med-express-99faa.appspot.com',
    messagingSenderId: '999480160094',
    projectId: 'med-express-99faa',
  
    // enable persistence by adding the below flag
    persistence: true,
  };
  
  
  
  useEffect(() => {
    const disableBackButton = () => {
      return true;
    };

    // Add a listener for the back button press event
    BackHandler.addEventListener('hardwareBackPress', disableBackButton);

    // Clean up the listener when the component unmounts
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', disableBackButton);
    };
  }, []); // Add isFocused as a dependency

  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        try {
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
      
          const messagingInstance = firebase.messaging();
      
          messagingInstance.getToken().then(token => {
            console.log('FCM Token:', token);
            saveFcmToken(userInfo.user.userId, token); // Implement this function
          }).catch(error => {
            console.log('Error getting FCM token:', error);
          });

          if(userInfo && userInfo.user.role === "patient"){
            const response = await getNearestPharmacies(userInfo.user.userId)
            setNearestPharmacies(response.data || [])
          } else if (userInfo && userInfo.user.role === "pharmacy"){
            const response = await getNearestDeliveryPersons(userInfo.user.userId)
            setNearestDeliveryPersons(response.data || [])
          } else if (userInfo && userInfo.user.role === "admin"){
            const response = await getAllUsers();
            setAllUsers(response.data || [])
          }
        } catch (error) {
          // Handle error if AsyncStorage or getMyOrders fails
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
    },[isFocused])



      useEffect(() => {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
    
        const messagingInstance = firebase.messaging();
    
        messagingInstance.getToken().then(token => {
          console.log('FCM Token:', token);
          saveFcmToken(userInfo.user.userId, token); // Implement this function
        }).catch(error => {
          console.log('Error getting FCM token:', error);
        });
    
        PushNotification.createChannel({
          channelId: '111',
          channelName: 'My Channel',
        });

        PushNotification.configure({
            onNotification: function (notification) {
                if (notification.foreground) {
                 navigation.navigate("Notifs")
                }

                if (notification.userInteraction) {
                  navigation.navigate("Notifs")
                }
              },
          })
    
        const handleRemoteMessage = remoteMessage => {
          if (remoteMessage && remoteMessage.notification && remoteMessage.notification.title && remoteMessage.notification.body) {
            PushNotification.localNotification({
              channelId: '111',
              title: remoteMessage.notification.title,
              message: remoteMessage.notification.body,
            });
          }
        };
    
        messagingInstance.onMessage(handleRemoteMessage);
        messagingInstance.setBackgroundMessageHandler(handleRemoteMessage);
    
        return () => {
          // Clean up any listeners or resources here if needed
        };
      }, []);
    
      const renderItem = ({ item }) => (
        <View style={{ padding: 20, margin: 10, backgroundColor: "#F0E2E2", borderColor: 'black', borderWidth: 1 }}>
          <Text>Username: {item && item.firstName ? item.firstName : ""}</Text>
          <Text>Email: {item && item.email ? item.email : ""}</Text>
          <Text>Username: {item && item.username ? item.username : ""}</Text>
          <Text>Distance: {item && item.distance ? item.distance : ""}</Text>
        </View>
      );
    
      
      const handleDetailsPress = (item) => {
        navigation.navigate('UserScreen', { item });
      };
    
      const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.touchable} onPress={() => handleDetailsPress(item)}>
          <View style={styles.detailsContainer}>
          <Text style={styles.orderId}>Username: {item.username}</Text>
            <Text style={styles.prescriptionText}>FirstName: {item.firstName}</Text>
            <Text style={styles.prescriptionText}>LastName: {item.lastName}</Text>
            <Text style={styles.prescriptionText}>Email: {item.email}</Text>
            <Text style={styles.prescriptionText}>Role: {item.roleName ? item.roleName : ""}</Text>
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
      data={userInfo && userInfo.user && userInfo.user.role && (userInfo.user.role === "patient" || userInfo.user.role === "deliveryPerson") ? 
      nearestPharmacies : userInfo && userInfo.user && userInfo.user.role === "admin" ? allUsers : nearestDeliveryPersons}
      renderItem={userInfo && userInfo.user && userInfo.user.role != "admin" ? renderItem  : renderUserItem}
      keyExtractor={item => item._id}
      />
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

export default HomeScreen;

