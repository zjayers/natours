// IMPORT MODULES
const express = require('express'); //express framework
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// MOUNT ROUTER
const router = express.Router();

// *SIGN UP/LOGIN ROUTES
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// *PASSWORD FORGOT/RESET ROUTES
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//router.use(authController.protect); // Protect all routes below this middleware - require user to be logged in.

router.patch('/updateMyPassword', authController.updatePassword);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//router.use(authController.restrictTo('admin')); // Restrict all access to routes below this middleware - only admins may access

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser) //do NOT update passwords with this
  .delete(userController.deleteUser);

// EXPORT ROUTER
module.exports = router;
