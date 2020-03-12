//  IMPORT MODULES
const Tour = require('./../models/tourModel');

/**
 *!MIDDLEWARE
 **ALIAS - TOP TOURS
 * Middleware function to pre-fill the query string to show a predefined, commonly visited link
 * @param {*} req
 * @param {*} res
 * @param {*} next
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
    // FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(element => {
      delete queryObj[element];
    });

    // ADVANCED FILTERING - Operators - prepend gte, gt, lte, lt with '$'
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /(\bgte|gt|lte|lt\b)/g,
      matchedStr => `$${matchedStr}`
    );

    // RUN THE QUERY AND STORE THE RESPONSE FOR FURTHER PARSING
    let query = Tour.find(JSON.parse(queryStr));

    // SORTING if a sort variable is present in the query
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      //If no sort field is specified - sort descending by createdAt Date
      query = query.sort('-createdAt');
    }

    // FIELD LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      //DEFAULT TO NOT INCLUDE FIELDS THAT SHOULD NOT NEED TO BE SENT
      query = query.select('-__v');
    }

    //PAGINATION
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Check if documents skipped is greater than the requested skip
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('This page does not exist.');
      }
    }

    // EXECUTE QUERY
    const tours = await query;

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
