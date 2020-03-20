// IMPORT MODULES
const express = require('express'); //express framework
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// MOUNT THE ROUTER
// Merge params so this router can access parameters of tour router
const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

//EXPORT THE ROUTER
module.exports = router;
