const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//*SIGNUP METHOD
exports.signup = catchAsync(async (req, res) => {
  //! Only allow data needed from user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  //* Log the new user in as soon as they sign up
  const token = signToken(newUser._id);
  //* Send the token to the user
  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

//*LOGIN METHOD
exports.login = catchAsync(async (req, res, next) => {
  //Get the email and password credentials
  const { email, password } = req.body;

  // - Check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide both email and password!', 400));

  // - Check if the user exists in the database && if the password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // - If all is true, send the JWT to the client
  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});

//!PROTECTED ROUTE MIDDLEWARE
exports.protect = catchAsync(async (req, res, next) => {
  // Get the token from the user
  let token;

  // Check if there are headers in the request, and if the token exists with template 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verify the token is authentic - promisify the verify process so it can be awaited
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists in database
  const freshUser = await User.findById(payload.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );

  // Check if the user has changed password after the token was issued
  if (freshUser.changedPasswordAfter(payload.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  //Add user data to the request for future use in the app
  req.user = freshUser;
  //Grant access to the protected route
  next();
});
