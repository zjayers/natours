//  IMPORT MODULES
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

/**
 *!MIDDLEWARE
 **ALIAS - TOP TOURS
 * Middleware function to pre-fill the query string to show a predefined, commonly visited link
 * @param {*} req The HTTP request
 * @param {*} res The HTTP response sent to the user
 * @param {*} next Middleware variable 'next'
 */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/**
 **GET ALL TOURS
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.getAllTours = catchAsync(async (req, res, next) => {
  // BUILD THE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pageinate();

  // EXECUTE QUERY
  const tours = await features.dbQuery;

  //SEND RESPONSE TO USER
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

/**
 **GET ONE TOUR
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    throw new AppError('No tour found with that ID', 404);
  }

  res.status(200).json({ status: 'success', data: { tour } });
});

/**
 **CREATE TOURS
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tour: newTour } });
});

/**
 **UPDATE TOURS
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //Return the new document
    runValidators: true //Validate that input values are of correct type
  });

  if (!tour) {
    throw new AppError('No tour found with that ID', 404);
  }

  res.status(200).json({ status: 'success', data: { tour } });
});

/**
 **DELETE ONE TOUR
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    throw new AppError('No tour found with that ID', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 ** GET TOUR STATS
 * Gets predefined stats with the aggregation pipeline
 * @param {*} req The HTTP request object
 * @param {*} res The HTTP response to the user
 */
exports.getTourStats = catchAsync(async (req, res, next) => {
  // Group by difficulty and calculate averages
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({ status: 'success', data: { stats } });
});

/**
 **GET MONTHLY PLAN
 * Unwind and aggregate the tour data to show the busiest month of the given year
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = parseInt(req.params.year, 10);
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numToursStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({ status: 'success', data: { plan } });
});
