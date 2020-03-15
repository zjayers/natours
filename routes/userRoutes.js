// IMPORT MODULES
const express = require('express'); //express framework
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// MOUNT ROUTER
const router = express.Router();

// *SIGN UP/LOGIN ROUTES
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// *PASSWORD FORGOT/RESET ROUTES
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

// DEFINE THE ROUTES
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// EXPORT ROUTER
module.exports = router;
