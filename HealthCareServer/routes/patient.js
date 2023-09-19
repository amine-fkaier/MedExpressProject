var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isAuth } = require('../middlewares/auth');
const { getNearestPharmacies, addOrder, getMyOrders, getOrderDetails, payOrder } = require('../controllers/patient');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const orderId = req.body.orderId || 'default'; // Replace with actual order ID
      const folderPath = path.join(__dirname, '..', 'assets', 'orders', req.body.folderName);
  
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
  
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage });

router.get('/getNearestPharmacies/:userId', getNearestPharmacies);
router.get('/getMyOrders/:userId', getMyOrders);
router.get('/getOrderDetails/:orderId', getOrderDetails);
router.post('/addOrder', upload.array('images'), addOrder);
router.post('/payOrder/:orderId', payOrder);

module.exports = router;
