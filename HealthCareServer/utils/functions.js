const admin = require('firebase-admin');
const Notif = require('../models/notif');

function distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(2);
  }
  
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  


  async function sendNotif(receiver, sender, type, messageObj){
    if(receiver && receiver.fcmToken) {
      admin.messaging().send(messageObj).then(async response => {
        console.log('Push notification sent:', response);
      })
      .catch(error => {
        console.error('Error sending push notification:', error);
      });
    } else {
      console.log('check user infos')
    }

    const newNotif = new Notif({
      type,
      senderId: sender._id,
      senderEmail: sender.email,
      receiverId: receiver._id,
      createdAt: new Date(),
    });
    const result = await newNotif.save();
    console.log({result})
  }

  module.exports = {distance, sendNotif};