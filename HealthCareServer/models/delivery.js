const mongoose = require("mongoose");

const Delivery = mongoose.model(
  "Delivery",
  new mongoose.Schema({
    OrderId: String,
    deliveryPersonId: String,
    status: String,
    orders: [],
    creationDate: Date
  })
);

module.exports = Delivery;
