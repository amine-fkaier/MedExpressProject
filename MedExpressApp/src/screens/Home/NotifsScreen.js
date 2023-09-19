import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {Button, StyleSheet, Text, View, BackHandler, FlatList, ScrollView} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { useIsFocused } from '@react-navigation/native';
import {AuthContext} from '../../apis/Users.js'
import { PatientContext } from '../../apis/patients.js';
import { PharmacyContext } from '../../apis/Pharmacies.js';
import { HeaderBackButton } from '@react-navigation/elements';
import { List, Avatar } from 'react-native-paper';

const dummyNotifications = [
  {
    type: 'Message',
    senderId: 'user123',
    receiversId: 'user456, user789',
    createdAt: new Date(),
  },
  // ... other dummy notifications
];

const notifsType = {"acceptedDelivery": "Livraison acceptée", "refusedDelivery": "Livraison annulée", 
"finalizedDelivery": "Livraison finalisée", "addedOrder": "Commande ajoutée",  "payedOrder": "commande payée",
"refusedOrder": "Commande réfusée" ,"acceptedOrder": "Commande acceptée",  "newDelivery": "Nouvelle livraison", 
 "addedUser": "Utilisateur ajouté"}

















const NotifsScreen = ({navigation}) => {
  const isFocused = useIsFocused(); // Get the focus state using the hook
  const {getNotifsByUser, userInfo} = useContext(AuthContext);
  const [notifs, setNotifs] = useState([])


  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate("Home")} />
      ),
      headerShown: true,
      drawerEnabled: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        if(userInfo && userInfo.user && userInfo.user.userId){
          const response = await getNotifsByUser(userInfo.user.userId)
          if(response && response.success){
            setNotifs(response.data.reverse())
          }
        }
        
      };
      fetchData();
    } else {
      setNotifs([])
    }
    },[isFocused])
  const renderItem = ({ item }) => (
    <List.Item
      title={notifsType[item.type]}
      description={`From: ${item.senderEmail}\n${item.createdAt}`}
      left={(props) => <Avatar.Icon {...props} icon="bell" />}
      style={styles.notificationItem}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        {notifs.map((item, index) => (
          <React.Fragment key={index}>{renderItem({ item })}</React.Fragment>
        ))}
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  notificationItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default NotifsScreen;
