// IMPORT MODULES
const express = require('express'); //express framework
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// INIT EXPRESS FRAMEWORK
const app = express();

// INIT MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// INIT ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ROUTE HANDLER FOR NON-EXISTENT ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Add Global Error Handler Middleware
app.use(globalErrorHandler);

// EXPORT THIS MODULE
module.exports = app;
