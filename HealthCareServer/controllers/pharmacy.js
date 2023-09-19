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
    const orders = await Order.find({pharmacyId: req.params.userId})
    res.json({ success: true, data: orders || []});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}

async function acceptOrder(req, res) {
  const { orderId, orderComment } = req.body;
  console.log({orderComment})
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: "accepted", orderComment: orderComment },
    { new: true }
  );
  if(updatedOrder){
    if(updatedOrder.orderStatus === "accepted"){
      res.json({ success: true, data: updatedOrder });

      const receiver = await User.findById(updatedOrder.patientId);
      const sender = await User.findById(updatedOrder.pharmacyId);

      if(receiver) {
        const token = receiver.fcmToken; // Assuming you have a single token in the tokens array
        const message = {
          token: token,
          notification: {
            title: "Commande acceptée",
            body: `Votre commande ${orderId} est acceptée par la pharmacie ${sender.username}`,
          },  
        }
        sendNotif(receiver, sender, "acceptedOrder", message);
  
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

async function refuseOrder(req, res) {
  const { orderId, orderComment } = req.body;
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: "refused", orderComment: orderComment },
    { new: true }
  );
  if(updatedOrder){
    if(updatedOrder.orderStatus === "refused"){
      res.json({ success: true, data: updatedOrder });

      const receiver = await User.findById(updatedOrder.patientId);
      const sender = await User.findById(updatedOrder.pharmacyId);
      if(receiver) {
        const token = receiver.fcmToken; // Assuming you have a single token in the tokens array
        const message = {
          token: token,
          notification: {
            title: "Commande refusée",
            body: `Votre commande ${orderId} est refusée par la pharmacie ${sender.username}`,
          },  
        }
        sendNotif(receiver, sender, "refusedOrder", message);
  
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

async function getNearestDeliveryPersons(req, res) {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);
      const gpsPosition = user.gpsPostion;
      const nearestDeliveryPersons = []
      const users = await User.find({});
      const deliveryPersonRole = await Role.findOne({name: 'deliveryPerson'})
      const deliveryPersons = users.filter(user => user.role.equals(deliveryPersonRole._id) && user.status === "accepted");
      const longPharmacy = gpsPosition.longitude;
      const latPharmacy = gpsPosition.lattitude;

      deliveryPersons.map((deliveryPerson) => {
        const longPH = deliveryPerson.gpsPostion.longitude;
        const latPH = deliveryPerson.gpsPostion.lattitude;
        const dist = distance(latPH, longPH, latPharmacy, longPharmacy)
        if(dist <= 100){
          deliveryPerson['distance'] = dist;
          nearestDeliveryPersons.push(deliveryPerson)
        }
      });
      res.json({ success: true, data: nearestDeliveryPersons || []});

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
  
}

async function passOrderToDelivery(req, res){
  const { orderId, deliveryPersonId } = req.body;
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { deliveryStatus: "pending", deliveryPersonId },
    { new: true }
  );
  if(updatedOrder){
    res.json({ success: true, data: updatedOrder });

    const receiver = await User.findById(deliveryPersonId);
    const sender = await User.findById(updatedOrder.pharmacyId);

    if(receiver) {
      const token = receiver.fcmToken; // Assuming you have a single token in the tokens array
      const message = {
        token: token,
        notification: {
          title: "Nouvelle livraison",
          body: `Vous avez une nouvelle livraison envoyée par la pharmacie ${sender.username}`,
        },  
      }
      sendNotif(receiver, sender, "newDelivery", message);


    } else {
      console.log('check user infos')
    }
  } else {
    res.json({ success: false, message: "Cette commande n'existe pas" });
  }
}

async function getPharmacyById(req, res){
  const {pharmacyId} = req.params;
  const pharmacy = await User.findById(pharmacyId);
  if(pharmacy){
    res.json({ success: true, data: pharmacy });
  } else {
    res.json({ success: false, message: "Cette pharmacy n'existe pas" });
  }
}

module.exports = {
    getMyOrders,
    acceptOrder,
    refuseOrder,
    getNearestDeliveryPersons,
    passOrderToDelivery,
    getPharmacyById
};