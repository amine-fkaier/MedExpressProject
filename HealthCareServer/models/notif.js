const mongoose = require("mongoose");

const Notif = mongoose.model(
  "Notif",
  new mongoose.Schema({
    type: String,
    senderId: String,
    senderEmail: String,
    receiverId: String,
    createdAt: Date
  })
);

module.exports = Notif;