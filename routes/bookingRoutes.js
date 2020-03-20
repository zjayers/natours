// IMPORT MODULES
const express = require('express'); //express framework
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// MOUNT THE ROUTER
// Merge params so this router can access parameters of tour router
const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

//EXPORT THE ROUTER
module.exports = router;
