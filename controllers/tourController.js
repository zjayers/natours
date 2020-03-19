//  IMPORT MODULES
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

//* Factory Functions
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// * MULTER FILE UPLOAD HANDLING
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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 70 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // Tour Images
  req.body.images = [];

  const promises = req.files.images.map(async (file, i) => {
    const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 70 })
      .toFile(`public/img/tours/${fileName}`);

    req.body.images.push(fileName);
  });

  await Promise.all(promises);

  next();
});

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

// * GET TOURS NEARBY
///tours-nearby/:distance/center/:latlng/unit/:unit
exports.getToursNearby = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format of 'lat, lng'",
        400
      )
    );

  // Find the radius in radians by dividing the distance by the radius of the Earth
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } //latitude, longitude, radius in radians
  });

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { data: tours } });
});

//* GET DISTANCE TO
exports.getDistanceTo = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format of 'lat, lng'",
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //!NOTE - GEONEAR MUST BE FIRST IN GEO AGGREGATION PIPELINE & MODEL MUST HAVE A GEOSPACIAL INDEX
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier //Convert to Kilometers
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: distances }
  });
});
