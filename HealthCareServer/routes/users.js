var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const {
  createUser,
  userSignIn,
  uploadProfile,
  signOut,
  verifyUserAccount,
  getAllRoles,
  saveFcmToken,
  getAllUsers,
  getNotifsByUser
} = require('../controllers/user');
const { isAuth, isAdmin } = require('../middlewares/auth');
const {
  validateUserSignUp,
  userValidation,
  validateUserSignIn,
} = require('../middlewares/validation/user');

router.post('/createUser', validateUserSignUp, userValidation, createUser);
router.post('/signIn', validateUserSignIn, userValidation, userSignIn);
router.post('/signOut', isAuth, signOut);
router.post('/verifyUserAccount', verifyUserAccount);
router.get('/getAllRoles', getAllRoles);
router.post('/saveFcmToken', saveFcmToken);
router.get('/getAllUsers', getAllUsers);
router.get('/getNotifsByUser/:userId', getNotifsByUser);

module.exports = router;
