// IMPORT MODULES
const express = require('express'); //express framework
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// MOUNT THE ROUTER
// Merge params so this router can access parameters of tour router
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// DEFINE THE ROUTES
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

//EXPORT THE ROUTER
module.exports = router;
