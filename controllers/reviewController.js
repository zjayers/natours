//  IMPORT MODULES
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

/**
 **GET ALL REVIEWS
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.getAllReviews = catchAsync(async (req, res, next) => {
  // BUILD THE QUERY
  const reviews = await Review.find();

  //SEND RESPONSE TO USER
  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
});

/**
 **CREATE NEW REVIEW
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({ status: 'success', data: { review: newReview } });
});
