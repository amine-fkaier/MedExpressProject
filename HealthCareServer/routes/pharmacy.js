var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isAuth } = require('../middlewares/auth');
const { getMyOrders, refuseOrder, acceptOrder, getNearestDeliveryPersons, passOrderToDelivery, getPharmacyById } = require('../controllers/pharmacy');

router.get('/getMyOrders/:userId', getMyOrders);
router.post('/acceptOrder', acceptOrder);
router.post('/refuseOrder', refuseOrder);
router.get('/getNearestDeliveryPersons/:userId', getNearestDeliveryPersons);
router.post('/passOrderToDelivery', passOrderToDelivery);
router.get('/getPharmacyById/:pharmacyId', getPharmacyById);

module.exports = router;
