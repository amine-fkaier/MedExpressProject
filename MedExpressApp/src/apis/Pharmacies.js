import React, { createContext, useState, useEffect  } from 'react';
import { ToastAndroid } from 'react-native';

import client from '../config/config'
export const PharmacyContext = createContext();


export const PharmaciesProvider = ({ children }) => {
  const [error, setError] = useState('');

  const getOrdersPerPharmacy = async (pharmacyId) => {
    const {data} = await client.get(`/pharmacies/getMyOrders/${pharmacyId}`);
    return data;
  }

  const acceptOrRefuseOrder = async (orderId, response, orderComment) => {
    const body = {
      orderId,
      orderComment
    }
    if(response === "accepted"){
      const {data} = await client.post(`/pharmacies/acceptOrder`, body);
      if(data.success === true){
        ToastAndroid.show("La commande a été acceptée avec succès", ToastAndroid.LONG)
      } else {
        ToastAndroid.show("Erreur lors de l'acceptation de la commande", ToastAndroid.LONG)
      }
      return data.data;
    }
    const {data} = await client.post(`/pharmacies/refuseOrder`, body);
    if(data.success === true){
      ToastAndroid.show("La commande a été refusée avec succès", ToastAndroid.LONG)
    } else {
      ToastAndroid.show("Erreur lors de refus de la commande", ToastAndroid.LONG)
    }
    return data.data;
  }

  const getNearestDeliveryPersons = async(userId) => {
    const {data} = await client.get(`/pharmacies/getNearestDeliveryPersons/${userId}`);
    return data;
  }

  const passOrderToDelivery = async(userId, orderId) => {
    const body = {
      orderId,
      deliveryPersonId: userId
    }
    const {data} = await client.post('/pharmacies/passOrderToDelivery', body);

    ToastAndroid.show("La demande de livraison est envoyée avec succés", ToastAndroid.LONG)
    return data.data;
  }

  const getPharmacyById = async(pharmacyId) => {
    console.log({pharmacyId})
    const {data} = await client.get(`/pharmacies/getPharmacyById/${pharmacyId}`);
    return data;
  }

  return (
    <PharmacyContext.Provider
      value={{
        getOrdersPerPharmacy,
        acceptOrRefuseOrder,
        getNearestDeliveryPersons,
        passOrderToDelivery,
        getPharmacyById
      }}>
    {children}
  </PharmacyContext.Provider>
  );
};



