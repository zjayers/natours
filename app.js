// IMPORT CORE MODULES
const express = require('express'); //express framework
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// INIT EXPRESS FRAMEWORK
const app = express();

// INIT MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());

// INIT ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
