//  IMPORT MODULES
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//* Factory Functions
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// Multer File Handling
/* const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    //user-userID-timestamp.jpeg
    const fileExt = file.mimetype.split('/')[1];
    callback(null, `user-${req.user.id}-${Date.now()}.${fileExt}`);
  }
}); */

const multerStorage = multer.memoryStorage(); //Store image as buffer so it can be processed by Sharp

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// * MULTER FILE UPLOAD
exports.uploadUserPhoto = upload.single('photo');

// * PHOTO RESIZER
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(128, 128)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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

// * GET ME
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// *ALLOW USER TO UPDATE PERSONAL USER DATA
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
  if (req.file) filteredReqBody.photo = req.file.filename;

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

//* Functionality for user to delete their account - this does not delete from the database
//* It only sets the user account to inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

// *CREATE USER - This is to remain an undefined route
exports.createUser = (req, res) => {
  //SEND RESPONSE TO USER
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Use /signup instead'
  });
};
