// IMPORT MODULES
const express = require('express'); //express framework
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

// MOUNT THE ROUTER
const router = express.Router();

// USE MIDDLEWARE PARAM TO CHECK ID AND RETURN 404 IF ID DOESN'T EXIST
// router.param('id', tourController.checkID);

//ALIAS ROUTES - use middleware to change the request object and edit the query
router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// DEFINE THE ROUTES
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//EXPORT THE ROUTER
module.exports = router;
