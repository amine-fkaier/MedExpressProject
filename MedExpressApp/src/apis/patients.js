import React, { createContext, useState, useEffect  } from 'react';
import { ToastAndroid } from 'react-native';

import client from '../config/config'
export const PatientContext = createContext();


export const PatientsProvider = ({ children }) => {
  const [error, setError] = useState('');

  const addOrder = async (userId, selectedImages, pharmacyId, navigation) => {
    try {
      const formData = new FormData();
      formData.append('patientId', userId);
      formData.append('pharmacyId', pharmacyId);
      formData.append('folderName', `${userId}_${(Math.floor(new Date().getTime())/ 1000)}`);
      let counter = 1
      selectedImages.forEach((image) => {
        formData.append('images', {
          uri: image,
          type: 'image/jpeg',
          name: `Prescription${counter}.jpg`
        });
        counter++;
      });

      const {data} = await client.post('/patients/addOrder', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if(data && data.success){
        ToastAndroid.show("Cette commande est ajoutée avec succés", ToastAndroid.LONG)
        navigation.navigate('MyOrders');
      } else {
        ToastAndroid.show("Error ajout commande", ToastAndroid.LONG)
      }

    } catch (error) {
      console.error({error});
      // Handle errors
    }
  };

  const getMyOrders = async (userId) => {
    const {data} = await client.get(`/patients/getMyOrders/${userId}`);
    return data;
  }

  const getOrderDetails = async (orderId) => {
    const {data} = await client.get(`/patients/getOrderDetails/${orderId}`);
    return data;
  }

  const getNearestPharmacies = async(userId) => {
    const {data} = await client.get(`/patients/getNearestPharmacies/${userId}`);
    return data;
  }


  const payOrder = async (orderId) => {
    const {data} = await client.post(`/patients/payOrder/${orderId}`,         
    {
        headers: {
        'Content-Type': "application/json",
        'Accept': "application/json",
        }  
    });
    if(data.success === true){
      ToastAndroid.show("La commande a été payée avec succès", ToastAndroid.LONG)
    } else {
      ToastAndroid.show("Erreur lors du paiement de la commande", ToastAndroid.LONG)
    }
    return data.data;
  }


  return (
    <PatientContext.Provider
      value={{
        addOrder,
        getMyOrders,
        getOrderDetails,
        getNearestPharmacies,
        payOrder
      }}>
    {children}
  </PatientContext.Provider>
  );
};



