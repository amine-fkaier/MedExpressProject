import React, {useLayoutEffect, useContext, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../../apis/Users';

const ProfileScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
    useLayoutEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <HeaderBackButton onPress={() => navigation.navigate("Home")} />
          ),
          headerShown: true, // Show the header
          drawerEnabled: false, // Hide the drawer
        });
      }, [navigation]);

  return (
    <View style={styles.container}>
        <FontAwesome name="user-circle" size={120} color="#007bff" />
        <Text style={styles.name}>{userInfo.user && userInfo.user.firstName ? userInfo.user.firstName : ''} 
        {userInfo.user && userInfo.user.lastName ? userInfo.user.lastName : ""}</Text>
        <Text style={styles.email}>{userInfo.user && userInfo.user.email ? userInfo.user.email : ""}</Text>

        {/* <TouchableOpacity style={styles.editButton} onPress={() => ToastAndroid.show('Cet utilisateur est ajouté avec succés', ToastAndroid.LONG)}>
        <FontAwesome name="edit" size={18} color="#ffffff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 20,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    email: {
      fontSize: 16,
      color: '#555555',
      marginBottom: 20,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#007bff',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    editButtonText: {
      color: '#ffffff',
      marginLeft: 8,
      fontSize: 16,
    },
  });

export default ProfileScreen;