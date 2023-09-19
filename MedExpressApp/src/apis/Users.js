import React, { createContext, useState, useEffect  } from 'react';
import { ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../config/config'
import axios from 'axios';
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(false);
  const [error, setError] = useState('');

  const  register = async(username, firstName, lastName, email, password, confirmPassword, role, gpsPostion, navigation) => {
    console.log({
      username,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      gpsPostion
    })
    try {
      const {data} =  await client.post(
        '/users/createUser',
        {
          username,
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          role,
          gpsPostion
        },
        {
            headers: {
            'Content-Type': "application/json",
            'Accept': "application/json",
            }  
        }   
     );
      if (data.success) {
        let userInfo = data;
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        ToastAndroid.show('Cet utilisateur est ajouté avec succés', ToastAndroid.LONG)
        setIsLoading(false);
        navigation.navigate('Login');

      }else{
        alert(data.message);
        setIsLoading(false);
      }
    } catch (e) {
      console.log({e});
        console.log(`register error ${e}`);
        setIsLoading(false);
    }
  }

  const login = async (email, password, navigation) => {
    setIsLoading(true);
    try {
      const {data} =  await client.post(
        '/users/signIn',
        {
          email,
          password,
        },
        {
            headers: {
            'Content-Type': "application/json",
            'Accept': "application/json",
            }  
        }   
     );
      if (data.success) {
        let userInfo = data;
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        navigation.navigate('Home');
        setIsLoading(false);
      }else{
        let errorMessage = ''
        switch(data.message){
          case "verifyEmailAndPwd":
            errorMessage = "Vérifier votre email et mot de passe";
            break;
          case "notYetUserVerification":
            errorMessage = "Cet utilisateur n'a pas encore verifier par l'admin!";
            break;
          case "refusedUser":
            errorMessage = "Cet utilisateur est refusé par l'admin";
            break;
        }
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
        setIsLoading(false);
      }
    } catch (error) { 
      setIsLoading(false);
      console.log({error});
    }
  };

  const logout = (navigation) => {
    setIsLoading(true);
    client.post(
      '/users/signOut',
      {},
      
        {      headers: {
                headers: {Authorization: `Bearer ${userInfo.token}`}  ,
          } }  
      ).then(async res => {
        AsyncStorage.removeItem('userInfo');
        navigation.navigate('Login');
        await saveFcmToken(userInfo.user.userId, "")
        setUserInfo({});
        setIsLoading(false);
        setError(null)
      })
      .catch(e => {
        console.log(`logout error ${e}`);
        setIsLoading(false);
      });      
  };


  const getAllRoles = async () => {
    try {
      const response =  await client.get(
        '/users/getAllRoles'
        ,
        {
            headers: {
            'Content-Type': "application/json",
            'Accept': "application/json",
            }  
        }   
     );
     let data = [];
     if(response && response.data && response.data.success === true){
      data = response.data.roles;
     }
     return data
    } catch (error) { 
      console.log({error});
    }
  };

  const saveFcmToken = async(userId, fcmToken) => {
    const body = {
      userId,
      fcmToken
    }
    const {data} = await client.post('/users/saveFcmToken', body);
    return data.data;
  }

  const getAllUsers = async () => {
    try {
      const response =  await client.get(
        '/users/getAllUsers'
        ,
        {
            headers: {
            'Content-Type': "application/json",
            'Accept': "application/json",
            }  
        }   
     );
     let data = [];
     if(response && response.data && response.data.success === true){
      data = response.data;
     }
     return data
    } catch (error) { 
      console.log({error});
    }
  };

  const verifyUserAccount = async (email, response) => {
    const body = {
      email, response
    }
    const {data} = await client.post('/users/verifyUserAccount', body);
    return data.updatedUser;
  }

  const getNotifsByUser = async(userId) => {
    const {data} = await client.get(`/users/getNotifsByUser/${userId}`);
    return data;
  }


  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDKK6iiB658v7Kgt8boawO9-UNhtuGnhok`
      );
  
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return null
      }
    } catch (error) {
      console.log({error})
    }
  };
  


  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userInfo,
        setUserInfo,
        splashLoading,
        setSplashLoading,
        error,
        register,
        login,
        logout,
        getAllRoles,
        saveFcmToken,
        getAllUsers,
        verifyUserAccount,
        getNotifsByUser,
        geocodeAddress
      }}>
    {children}
  </AuthContext.Provider>
  );
};