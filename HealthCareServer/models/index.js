const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user");
db.delivery = require("./delivery");
db.role = require("./role");
db.order = require("./order");
db.notif = require("./notif");

db.ROLES = ["admin", "patient", "pharmacy", "deliveryPerson"];

module.exports = db;