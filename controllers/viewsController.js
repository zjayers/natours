const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//* OVERVIEW ROUTE
exports.getOverview = catchAsync(async (req, res) => {
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
  res.status(200).render('login', { title: 'Login To Your Account' });
};

// *SIGNUP ROUTE
exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', { title: 'Create An Account' });
};

// *RESET PASSWORD ROUTES
exports.getResetForm = (req, res) => {
  res.status(200).render('resetPassword', { title: 'Reset Password' });
};

//* FORGOT PASSWORD FORMAT
exports.getForgotForm = (req, res) => {
  res.status(200).render('forgotPassword', { title: 'Forgot Password' });
};

//* GET ACCOUNT LOGIN
exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your Account' });
};

//* GET MY TOURS
exports.getMyTours = catchAsync(async (req, res) => {
  // Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //Find tours with the returned IDs
  const tourIds = bookings.map(el => el.tour.id);
  // Select all tours in the database with IDs that exist in the array
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', { title: 'My Tours', tours });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res
    .status(200)
    .render('account', { title: 'Your Account', user: updatedUser });
});
