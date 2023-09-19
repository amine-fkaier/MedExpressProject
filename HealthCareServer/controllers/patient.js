const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const User = require('../models/user');
const Role = require('../models/role');
const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { distance, sendNotif } = require('../utils/functions');
const app = express();
const port = 3000;
const admin = require('firebase-admin');

const serviceAccount = require('../notifServerKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://med-express-99faa-default-rtdb.firebaseio.com"
});


// Replace with your own API key
const apiKey = 'YOUR_GOOGLE_API_KEY';

async function getNearestPharmacies(req, res) {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);
      const gpsPosition = user.gpsPostion;
      const nearestPhramacies = []
      const users = await User.find({});
      const pharmacyRole = await Role.findOne({name: 'pharmacy'})
      const pharmacies = users.filter(user => user.role.equals(pharmacyRole._id) && user.status === "accepted");
      const longPatient = gpsPosition.longitude;
      const latPatient = gpsPosition.lattitude;

      pharmacies.map((pharmacy) => {
        const longPH = pharmacy.gpsPostion.longitude;
        const latPH = pharmacy.gpsPostion.lattitude;
        const dist = distance(latPH, longPH, latPatient, longPatient);
        if(dist <= 100){
          pharmacy['distance'] = dist;
          nearestPhramacies.push(pharmacy)
        }
      });
      res.json({ success: true, data: nearestPhramacies || []});

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
  
}

// Define API routes
async function addOrder(req, res) {
  try {
    const newOrder = new Order({
      orderStatus: 'pending',
      payed: false,
      patientId: req.body.patientId,
      pharmacyId: req.body.pharmacyId,
      prescriptions: req.files.map((file) => 
      path.join('orders', req.body.folderName, file.originalname).replace(/\\/g, '/')),
      createdAt: new Date()
    });

    const sender = await User.findById(req.body.patientId);
    const receiver = await User.findById(req.body.pharmacyId);

    console.log({receiver, sender})
    if(receiver) {
      const token = receiver.fcmToken; // Assuming you have a single token in the tokens array
      const message = {
        token: token,
        notification: {
          title: "Nouvelle commande",
          body: `${sender.username} a passé(e) une commande`,
        },  
      }
      sendNotif(receiver, sender, "addedOrder", message);
    } else {
      console.log('check user infos')
    }
    await newOrder.save();
    res.json({ success: true, message: 'Order added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({patientId: req.params.userId})
    res.json({ success: true, data: orders || []});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}

async function getOrderDetails(req, res) {
  try {
    const order = await Order.findById(req.params.orderId)
    res.json({ success: true, data: order || {}});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }

}

async function payOrder(req, res) {
  const { orderId } = req.params;
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { payed: true },
    { new: true }
  );
  if(updatedOrder){
    res.json({ success: true, data: updatedOrder });

    const sender = await User.findById(updatedOrder.patientId);
    const receiver = await User.findById(updatedOrder.pharmacyId);

    if(receiver) {
      const token = receiver.fcmToken; // Assuming you have a single token in the tokens array
      const message = {
        token: token,
        notification: {
          title: "Commande payée",
          body: `La commande ${orderId} est payée avec succés`,
        },  
      }
      sendNotif(receiver, sender, "payedOrder", message);


    } else {
      console.log('check user infos')
    }
  } else {
    res.json({ success: false, message: "Cette commande n'existe pas" });
  }
}



module.exports = {
    getNearestPharmacies, addOrder, getMyOrders, getOrderDetails, payOrder
};