const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//* OVERVIEW ROUTE
exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  res.status(200).render('overview', { title: 'All Tours', tours });
});

//* TOUR ROUTE
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError('There is no tour with that name.', 404));

  res.status(200).render('tour', { title: tour.name, tour });
});

// *LOGIN ROUTE
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Login Into Your Account' });
};
