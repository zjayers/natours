//  IMPORT MODULES
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  const users = await User.find();

  //SEND RESPONSE TO USER
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
});

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};

exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is note yet defined' });
};
