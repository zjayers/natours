//  IMPORT MODULES
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

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
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};

/**
 **GET ONE TOUR
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};

/**
 **CREATE TOURS
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};

/**
 **UPDATE TOURS
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //Return the new document
      runValidators: true //Validate that input values are of correct type
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};

/**
 **DELETE ONE TOUR
 * TODO ERROR HANDLING
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};

/**
 ** GET TOUR STATS
 * Gets predefined stats with the aggregation pipeline
 * @param {*} req The HTTP request object
 * @param {*} res The HTTP response to the user
 */
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};

/**
 **GET MONTHLY PLAN
 * Unwind and aggregate the tour data to show the busiest month of the given year
 * @param {*} req HTTP request from user
 * @param {*} res HTTP response to user
 */
exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({ status: 'fail', message: 'Invalid Data Sent' });
  }
};
