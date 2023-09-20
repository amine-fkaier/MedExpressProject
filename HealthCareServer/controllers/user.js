const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const Notif = require('../models/notif')
const { distance, sendNotif } = require('../utils/functions');

exports.createUser = async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    role,
    gpsPostion
  } = req.body;
  const roleName = (await Role.findById(req.body.role)).name;
  const isNewUser = await User.isThisEmailInUse(email);
  if (!isNewUser)
    return res.json({
      success: false,
      message: 'This email is already in use, try sign-in',
    });
  
  const roleObj = await Role.findById(role)
  if (!roleObj)
    return res.json({
      success: false,
      message: 'Please select a valid role',
    });

  const status = 'pending';

  const user = await User({
    username,
    firstName,
    lastName,
    email,
    password,
    role: roleObj,
    status,
    gpsPostion,
    roleName
  });


  const newUser = await user.save();

  const admin = await User.findOne({"roleName": "admin"});
  if(admin) {
    const token = admin.fcmToken; // Assuming you have a single token in the tokens array
    const message = {
      token: token,
      notification: {
        title: "Nouveau utilisateur",
        body: `Veuillez vérifier cet utilisateur ${newUser._id}`,
      },  
    }
    sendNotif(admin, user, "addedUser", message);
  } else {
    console.log("there is no admin")
  }

  res.json({ success: true, user });
};

exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.json({
      success: false,
      message: "verifyEmailAndPwd",
    });
  
    if (user.status === 'pending')
    return res.json({
      success: false,
      message: "notYetUserVerification",
    });

    if (user.status === 'refused')
    return res.json({
      success: false,
      message: "refusedUser",
    });


  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.json({
      success: false,
      message: 'email / password does not match!',
    });

   

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "MedExpress", {
    expiresIn: '1d',
  });

  let oldTokens = user.tokens || [];

  if (oldTokens.length) {
    oldTokens = oldTokens.filter(t => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  await User.findByIdAndUpdate(user._id, {
    tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
  });

  const roleObj = await Role.findById(user.role)
  const userInfo = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: roleObj.name,
    avatar: user.avatar ? user.avatar : '',
  };

  res.json({ success: true, user: userInfo, token });
};

exports.signOut = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Authorization fail!' });
    }

    const tokens = req.user.tokens;

    const newTokens = tokens.filter(t => t.token !== token);

    await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
    res.json({ success: true, message: 'Sign out successfully!' });
  }
};

exports.verifyUserAccount = async (req, res) => {
  const { email, response } = req.body;
  const updatedUser = await User.findOneAndUpdate(
    { email: email },
    { status: response },
    { new: true }
  );
  if(updatedUser){
    res.json({ success: true, updatedUser });
  } else {
    res.json({ success: false, message: "Cet utilisateur n'existe pas" });
  }
}

exports.getAllRoles = async(req, res) => {
  const roles = await Role.find();  
  res.json({ success: true, roles: roles || [] });
}

exports.saveFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { fcmToken },
    { new: true }
  );
  if(updatedUser){
    res.json({ success: true, updatedUser });
  } else {
    res.json({ success: false, message: "Cet utilisateur n'existe pas" });
  }
}

exports.getAllUsers = async(req, res) => {
  let allUsers = await User.find();
  const adminRole = await Role.findOne({"name": "admin"})
  if(allUsers && allUsers.length){
    allUsers = allUsers.filter((user) => user.role.toString() !== adminRole._id.toString())
  }
  res.json({ success: true, data: allUsers });
}


exports.getNotifsByUser = async(req, res) => {
  const {userId} = req.params;
  const notifs = await Notif.find({receiverId: userId});
  res.json({ success: true, data: notifs });
}