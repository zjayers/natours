// IMPORT MODULES
const express = require('express'); //express framework
const tourController = require('./../controllers/tourController');

// MOUNT THE ROUTER
const router = express.Router();

// USE MIDDLEWARE PARAM TO CHECK ID AND RETURN 404 IF ID DOESN'T EXIST
router.param('id', tourController.checkID);

// DEFINE THE ROUTES
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

//EXPORT THE ROUTER
module.exports = router;
