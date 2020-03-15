// IMPORT MODULES
const express = require('express'); //express framework
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// MOUNT THE ROUTER
const router = express.Router();

// DEFINE THE ROUTES
router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

//EXPORT THE ROUTER
module.exports = router;
