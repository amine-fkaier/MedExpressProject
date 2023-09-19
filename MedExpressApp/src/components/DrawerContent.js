import React, { useContext, useEffect }  from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {AuthContext} from '../apis/Users.js'
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';



const DrawerContent = () => {
  const {userInfo, isLoading, logout} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleNavigation('Home')} style={styles.item}>
        <Entypo name="home" size={20} />
        <Text style={styles.itemText}>Accueil</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleNavigation('Notifs')} style={styles.item}>
        <IoniconsIcons name="notifications" size={20} />
        <Text style={styles.itemText}>Notifications</Text>
      </TouchableOpacity>

      {userInfo && userInfo.user && userInfo.user.role !== "admin"?
      <View>
        <TouchableOpacity onPress={() => handleNavigation('MyOrders')} style={styles.item}>
          <Entypo name="list" size={20} />
          <Text style={styles.itemText}>Mes commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleNavigation('MyProfile')} style={styles.item}>
          <Entypo name="user" size={20} />
          <Text style={styles.itemText}>Mon profil</Text>
        </TouchableOpacity>
    </View>
     :
     <View/>}




      <TouchableOpacity onPress={() => logout(navigation)} style={styles.item}>
        <SimpleLineIcons name="logout" size={20} />
        <Text style={styles.itemText}>Se déconnecter</Text>
      </TouchableOpacity>

      {/* Add more menu items as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'black',
  },
});

export default DrawerContent;
