//  IMPORT MODULES
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/**
 * *Filter Request Body
 *
 * @param {*} obj The request object to filter
 * @param {*} allowedFields The allowed fields that can be returned from the function
 */
const filterRequestBody = (obj, ...allowedFields) => {
  const filteredBody = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) filteredBody[el] = obj[el];
  });
  return filteredBody;
};

// *ALLOW USER TO UPDATE USER DATA
exports.updateMe = catchAsync(async (req, res, next) => {
  // Create an error if the user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates! Please use ../updateMyPassword',
        400
      )
    );
  }
  // Update the user document
  // Filter the request body so the user can only send their name, email, image, etc.
  const filteredReqBody = filterRequestBody(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredReqBody,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

// *GET ALL USERS
exports.getAllUsers = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  const users = await User.find();

  //SEND RESPONSE TO USER7
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
});

// *GET ONE USER
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};

// *CREATE NEW USER
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};

// *UPDATE USER
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};

// *DELETE USER
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};
