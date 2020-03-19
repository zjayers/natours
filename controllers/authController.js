const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

// *JWT TOKEN SIGNER
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// *JWT TOKEN SENDER
const createSendToken = (user, statusCode, res) => {
  //* Log the new user in as soon as they sign up
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //Convert to milliseconds
    ),
    httpOnly: true
  };

  // ! LOGIN FUNCTIONALITY DOESNT WORK IN PRODUCTION UNLESS PROTOCOL IS HTTPS
  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //Remove password from the output
  user.password = undefined;
  //* Send the token to the user
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

//*SIGNUP METHOD
exports.signup = catchAsync(async (req, res) => {
  //! Only allow data needed from user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  //Send the JWT Token
  createSendToken(newUser, 201, res);
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

  //Send the JWT Token
  createSendToken(user, 200, res);
});

//* LOGOUT METHOD
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verify the token is authentic - promisify the verify process so it can be awaited
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists in database
  const currentUser = await User.findById(payload.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );

  // Check if the user has changed password after the token was issued
  if (currentUser.changedPasswordAfter(payload.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  //Add user data to the request to use in next middleware function
  req.user = currentUser;
  // MAKE USER ACCESSIBLE TO PUG TEMPLATES
  res.locals.user = currentUser;
  //Grant access to the protected route
  next();
});

//this function will test the req.cookies.jwt value to see if it's null
Object.exists = function(obj) {
  return typeof obj !== 'undefined' && obj !== null;
};

//!MIDDLEWARE TO CHECK WHEN USER IS LOGGED IN
exports.isLoggedIn = async (req, res, next) => {
  //if the jwt stores the value of loggedout then pass on to the next Middleware
  if (req.cookies.jwt === 'loggedout') return next();

  if (req.cookies.jwt) {
    // Verify the token is authentic - promisify the verify process so it can be awaited
    const payload = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // Check if the user still exists in database
    const currentUser = await User.findById(payload.id);
    if (!currentUser) return next();

    // Check if the user has changed password after the token was issued
    if (currentUser.changedPasswordAfter(payload.iat)) return next();

    // THERE IS A LOGGED IN USER
    //Add user data to the request to use in next middleware function
    req.user = currentUser;
    // MAKE USER ACCESSIBLE TO PUG TEMPLATES
    res.locals.user = currentUser;

    return next();
  }

  if (!Object.exists(res.cookie.jwt)) {
    //This is where we check whether the cookie is null
    return next();
  }
};

//!RESTRICTED ROUTE MIDDLEWARE
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

// *FORGOT PASSWORD ROUTE
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POST email address
  const user = await User.findOne({ email: req.body.email });
  console.log(req.body);
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // Generate the random reset tokens
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    //Send the token to user's email address
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword#${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email!' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        `There was an issue sending the email. Try again later!${error}`,
        500
      )
    );
  }
});

// *RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the provided tokens
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If token has not expired, and user exists, set the new passwordResetExpires
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  //Set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //Send the JWT Token
  createSendToken(user, 200, res);
});

// *Change User Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get the user from the database query
  const user = await User.findById(req.user.id).select('+password');

  // Check if the POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is not correct.', 401));
  }

  // If so, update the password field
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  ///Send the JWT Token
  createSendToken(user, 200, res);
});
