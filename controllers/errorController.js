const AppError = require('./../utils/appError');

/**
 * Send Error Information When In Development
 *
 * @param {*} err
 * @param {*} res
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send Error Information When In Production
 *
 * @param {*} err
 * @param {*} res
 */
const sendErrorProd = (err, res) => {
  //Operational, trusted error: Send Message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Programming or other unknown error: don't leak details to client - send generic message instead
  } else {
    //Log error to the console
    console.error('ERROR', err);
    res.status(500).json({ status: 'error', message: 'Something went wrong' });
  }
};

/**
 ** HANDLE ID CAST ERRORS
 *
 * @param {*} err
 * @returns AppError
 */
const handleCastErrorDB = err => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};

/**
 ** HANDLE DUPLICATE FIELD ERRORS
 *
 * @param {*} err
 * @returns AppError
 */
const handleDuplicateFieldsDB = err => {
  // Get the duplicate name from between the quotes in the err.errmsg
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const msg = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(msg, 400);
};

/**
 ** HANDLE VALIDATION ERRORS
 *
 * @param {*} err
 * @returns AppError
 */
const handleValidationErrorDB = err => {
  const errArr = Object.values(err.errors).map(el => el.message);
  const msg = `Invalid input data. ${errArr.join('. ')}`;
  return new AppError(msg, 400);
};

// !GLOBAL ERROR HANDLING MIDDLEWARE
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //500 = InternalServerError
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // make a hard copy of the function variable
    let error = { ...err };

    // handle misc operational errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }

  next();
};
