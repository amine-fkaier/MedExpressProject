const mongoose = require("mongoose");

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    patientId: String,
    pharmacyId: String,
    deliveryPersonId: String,
    orderStatus: String,
    deliveryStatus: String,
    payed: Boolean,
    address: String,
    prescriptions: [],
    orderComment: String,
    deliveryComment: String,
    createdAt: Date
  })
);

module.exports = Order;