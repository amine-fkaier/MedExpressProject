import React, { createContext, useState, useEffect  } from 'react';
import { ToastAndroid } from 'react-native';

import client from '../config/config'
export const DeliveryPersonContext = createContext();


export const DeliveryPersonsProvider = ({ children }) => {
  const [error, setError] = useState('');

  const getOrdersPerDeliveryPerson = async (deliveryPersonId) => {
    const {data} = await client.get(`/deliveryPersons/getMyOrders/${deliveryPersonId}`);
    return data;
  }

  const acceptOrRefuseDeliveryOrder = async (orderId, response, deliveryComment) => {
    const body = {
      orderId,
      deliveryComment
    }
    if(response === "accepted"){
      const {data} = await client.post(`/deliveryPersons/acceptDeliveryOrder`, body);
      if(data.success === true){
        ToastAndroid.show("La livraison de la commande a été acceptée avec succès", ToastAndroid.LONG)
      } else {
        ToastAndroid.show("Erreur lors de l'acceptation de livraison de la commande", ToastAndroid.LONG)
      }
      return data.data;
    }
    const {data} = await client.post(`/deliveryPersons/refuseDeliveryOrder`, body);
    if(data.success === true){
      ToastAndroid.show("La livraison de la commande a été refusée avec succès", ToastAndroid.LONG)
    } else {
      ToastAndroid.show("Erreur lors de refus de livraison de la commande", ToastAndroid.LONG)
    }
    return data.data;
  }

  const finalizeOrder = async (orderId) => {
    const {data} = await client.post(`/deliveryPersons/finalizeOrder/${orderId}`,         
    {
        headers: {
        'Content-Type': "application/json",
        'Accept': "application/json",
        }  
    });
    if(data.success === true){
      ToastAndroid.show("La commande a été finalisée avec succès", ToastAndroid.LONG)
    } else {
      ToastAndroid.show("Erreur lors de la finalisation de la commande", ToastAndroid.LONG)
    }
    return data.data;
  }


  const getDeliveryPersonById = async(deliveryPersonId) => {
    console.log({deliveryPersonId})
    const {data} = await client.get(`/deliveryPersons/getDeliveryPersonById/${deliveryPersonId}`);
    return data;
  }
  

  return (
    <DeliveryPersonContext.Provider
      value={{
        getOrdersPerDeliveryPerson,
        acceptOrRefuseDeliveryOrder,
        finalizeOrder,
        getDeliveryPersonById
      }}>
    {children}
  </DeliveryPersonContext.Provider>
  );
};



