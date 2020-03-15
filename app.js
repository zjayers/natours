// IMPORT MODULES
const express = require('express'); //express framework
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// INIT EXPRESS FRAMEWORK
const app = express();

//USE HELMET PACKAGE TO SET SECURITY HTTP HEADERS
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// *RATE LIMITER
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.'
});

// ADD RATE LIMITER TO THE API ROUTE
app.use('/api', limiter);

// BODY PARSER - READ DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' })); //Limit body to 10kb

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xssClean());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));

// INIT ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ROUTE HANDLER FOR NON-EXISTENT ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ADD GLOBAL ERROR HANDLER MIDDLEWARE
app.use(globalErrorHandler);

// EXPORT THIS MODULE
module.exports = app;
