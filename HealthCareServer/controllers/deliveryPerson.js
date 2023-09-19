const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const User = require('../models/user');
const Role = require('../models/role');
const { distance, sendNotif } = require('../utils/functions');
const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const admin = require('firebase-admin');

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({deliveryPersonId: req.params.userId})
    res.json({ success: true, data: orders || []});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}

async function acceptDeliveryOrder(req, res) {
    const { orderId, deliveryComment } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus: "accepted", deliveryComment: deliveryComment },
      { new: true }
    );
    if(updatedOrder){
      if(updatedOrder.deliveryStatus === "accepted"){
        res.json({ success: true, data: updatedOrder });

        const sender = await User.findById(updatedOrder.deliveryPersonId);
        const receiverPharmacy = await User.findById(updatedOrder.pharmacyId);
        let message = {
          token: receiverPharmacy.fcmToken,
          notification: {
            title: "Livraison acceptée",
            body: `Votre livraison ${orderId} est acceptée par le livreur ${sender.username}`,
          },  
        }
        sendNotif(receiverPharmacy, sender, "acceptedDelivery", message);


        const receiverPatient = await User.findById(updatedOrder.patientId);
        message = {
          token: receiverPatient.fcmToken,
          notification: {
            title: "Livraison acceptée",
            body: `Votre livraison ${orderId} est acceptée par le livreur ${sender.username}`,
          },  
        }
        sendNotif(receiverPatient, sender, "acceptedDelivery", message);

      } else {
        res.json({ success: false, message: "Aucun changement" });
      }
    } else {
      res.json({ success: false, message: "Cette commande n'existe pas" });
    }
  }
  
  async function refuseDeliveryOrder(req, res) {
    const { orderId, deliveryComment } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus: "refused", deliveryComment },
      { new: true }
    );
    if(updatedOrder){
      if(updatedOrder.deliveryStatus === "refused"){
        res.json({ success: true, data: updatedOrder });

        const sender = await User.findById(updatedOrder.deliveryPersonId);
        const receiver = await User.findById(updatedOrder.pharmacyId);
        
        if(receiver) {
          const token = receiver.fcmToken; // Assuming you have a single token in the tokens array
          const message = {
            token: token,
            notification: {
              title: "Livraison refusée",
              body: `Votre livraison ${orderId} est refusée par le livreur ${sender.username}`,
            },  
          }
          sendNotif(receiver, sender, "refusedDelivery", message);
    
        } else {
          console.log('check user infos')
        }
      } else {
        res.json({ success: false, message: "Aucun changement" });
      }
    } else {
      res.json({ success: false, message: "Cette commande n'existe pas" });
    }
  }


  async function finalizeOrder(req, res) {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus: "finalized" },
      { new: true }
    );
    if(updatedOrder){
      res.json({ success: true, data: updatedOrder });

      const sender = await User.findById(updatedOrder.deliveryPersonId);
      const receiverPharmacy = await User.findById(updatedOrder.pharmacyId);
      const receiverPatient = await User.findById(updatedOrder.patientId);
      
      if(receiverPharmacy && receiverPatient) {
        const pharmacyToken = receiverPharmacy.fcmToken; // Assuming you have a single token in the tokens array
        const PharmacyMessage = {
          token: pharmacyToken,
          notification: {
            title: "Commande finalisée",
            body: `Votre commande ${orderId} est livrée avec succées`,
          },  
        }

        sendNotif(receiverPharmacy, sender, "finalizedDelivery", PharmacyMessage);

        const patientToken = receiverPatient.fcmToken; 
        const patientMessage = {
          token: patientToken,
          notification: {
            title: "Commande finalisée",
            body: `Votre commande ${orderId} est livrée avec succées`,
          },  
        }
        sendNotif(receiverPatient, sender, "finalizedDelivery", patientMessage);

  
      } else {
        console.log('check user infos')
      }
    } else {
      res.json({ success: false, message: "Cette commande n'existe pas" });
    }
  }


  async function getDeliveryPersonById(req, res){
    const {deliveryPersonId} = req.params;
    const deliveryPerson = await User.findById(deliveryPersonId);
    if(deliveryPerson){
      res.json({ success: true, data: deliveryPerson });
    } else {
      res.json({ success: false, message: "Ce livreur n'existe pas" });
    }
  }
  
  

module.exports = {
    getMyOrders,
    acceptDeliveryOrder,
    refuseDeliveryOrder,
    finalizeOrder,
    getDeliveryPersonById
};