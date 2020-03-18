//* IMPORTS
const mongoose = require('mongoose');
const Tour = require('./tourModel');

// *SCHEMA
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty.'],
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      default: 4.5,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must be below 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author.']
    }
  },
  {
    // Option to output virtual properties from schema
    // !NOTE: THESE VIRTUAL PROPERTIES CANNOT BE QUERIED
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//* INDEXES
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //Allows only 1 review per user on each tour

// *STATIC METHODS
// Calculate Averages Function
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// *VIRTUAL PROPERTIES
//None

//* DOCUMENT MIDDLEWARE
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

//* QUERY MIDDLEWARE
//Populate the Tour and User references in database output
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// !PRE AND POST MIDDLEWARE USED TO PULL THE CURRENT DOCUMENT FROM THE CURRENT QUERY - Then run it through post middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); //'this' is the current query variables - Workaround: Execute the current query to get the current document - create property to send to post-middleware
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  //await this.findOne(); does not work here, the query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour); //Retrieve document from the r property
});

//* AGGREGATE MIDDLEWARE
//None

//* CREATE EXPORT MODEL
const Review = mongoose.model('Review', reviewSchema);

//* EXPORT THIS MODULE
module.exports = Review;
