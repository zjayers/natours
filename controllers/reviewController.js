//  IMPORT MODULES
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

//* Factory Functions
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// !Middleware to set tour and user Id's when running CreateOne
exports.setTourAndUserIds = (req, res, next) => {
  // Allow nested routes
  // Define the tour and user routes when they aren't defined in the request body
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
