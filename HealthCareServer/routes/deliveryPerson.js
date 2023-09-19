var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getMyOrders, acceptDeliveryOrder, refuseDeliveryOrder, finalizeOrder, getDeliveryPersonById } = require('../controllers/deliveryPerson');

router.get('/getMyOrders/:userId', getMyOrders);
router.post('/acceptDeliveryOrder', acceptDeliveryOrder);
router.post('/refuseDeliveryOrder', refuseDeliveryOrder);
router.post('/finalizeOrder/:orderId', finalizeOrder);
router.get('/getDeliveryPersonById/:deliveryPersonId', getDeliveryPersonById);

module.exports = router;
