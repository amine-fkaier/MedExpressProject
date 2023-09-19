const { check, validationResult } = require('express-validator');

exports.validateUserSignUp = [
  check('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage('username is required!')
    .isString()
    .withMessage('Must be a valid username!')
    .isLength({ min: 3, max: 20 })
    .withMessage('username must be within 3 to 20 character!'),

  check('firstName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('firstname is required!')
    .isString()
    .withMessage('Must be a valid firstname!')
    .isLength({ min: 3, max: 20 })
    .withMessage('firstname must be within 3 to 20 character!'),

  check('lastName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('lastname is required!')
    .isString()
    .withMessage('Must be a valid lastname!')
    .isLength({ min: 3, max: 20 })
    .withMessage('lastname must be within 3 to 20 character!'),

  check('email').normalizeEmail().isEmail().withMessage('Invalid email!'),

  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is empty!')
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be 4 to 20 characters long!'),

  check('confirmPassword')
    .trim()
    .not()
    .isEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Both password must be same!');
      }
      return true;
    }),
];

exports.userValidation = (req, res, next) => {
  const result = validationResult(req).array();
  if (!result.length) return next();

  const error = result[0].msg;
  res.json({ success: false, message: error });
};

exports.validateUserSignIn = [
  check('email').trim().isEmail().withMessage('verifyEmailAndPwd'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('verifyEmailAndPwd'),
];
