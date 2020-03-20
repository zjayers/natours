// IMPORT MODULES
const express = require('express'); //express framework
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// MOUNT THE ROUTER
const router = express.Router();

// Direct tour router to use the review router if it encounters a review route
router.use('/:tourId/reviews', reviewRouter);

//ALIAS ROUTES - use middleware to change the request object and edit the query
router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// Route for finding tours within distance of coordinates
router
  .route('/tours-nearby/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursNearby);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistanceTo);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//EXPORT THE ROUTER
module.exports = router;
