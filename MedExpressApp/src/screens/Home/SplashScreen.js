import React, { useContext, useEffect  } from 'react';
import {StyleSheet,ActivityIndicator, View, Image, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import MySvgImage from '../../assets/logoApp.svg';
import { AuthContext } from '../../apis/Users.js';


const SplashScreen = ({navigation}) => {
  const {setUserInfo} = useContext(AuthContext);
  useEffect(() => {
    isLoggedIn();
  }, []);

  
  const isLoggedIn = async () => {
    try {
      let userInfo = await AsyncStorage.getItem('userInfo');
      userInfo = JSON.parse(userInfo);

      setTimeout(() => {
        if (userInfo && Object.keys(userInfo).length) {
          setUserInfo(userInfo);
          navigation.navigate('Home');
        } else {
          navigation.navigate('Login');
        }
      }, 3000);
    } catch (e) {
      console.log(`is logged in error ${e}`);
    }
  };


  return (
    <View
    style={[styles.container, styles.horizontal]}>
       <MySvgImage />
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      justifyContent: "center",
      alignItems: 'center',
      backgroundColor: 'white'
    },
    horizontal: {
        flex: 1,
      }
  });

export default SplashScreen;
