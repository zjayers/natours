//* IMPORTS
const mongoose = require('mongoose');

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

// *VIRTUAL PROPERTIES
//None

//* DOCUMENT MIDDLEWARE
//None

//* QUERY MIDDLEWARE
//None

//* AGGREGATE MIDDLEWARE
//None

//* CREATE EXPORT MODEL
const Review = mongoose.model('Review', reviewSchema);

//* EXPORT THIS MODULE
module.exports = Review;
