// IMPORT MODULES
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// CREATE TOUR SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have greater or equal to 10 characters']
      //!the below validator fails if there are spaces in the name
      // validate: [validator.isAlpha, 'A tour name may only contain characters']
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    summary: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "Difficulty can only be: 'easy', 'medium', or 'difficult'"
      }
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size']
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //!'this' will only point to current document on NEW document creation
          return val < this.price;
        },
        //!({VALUE}) is a Mongoose only property
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
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
// Determine the number of weeks in the tour duration
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// **DOCUMENT MIDDLEWARE
// CREATE NAME SLUG
// runs before the .save() and .create() commands
// !Does not run on .insertMany() or .findByIdAndUpdate() or .update()
tourSchema.pre('save', function(next) {
  // .this points to the current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// **QUERY MIDDLEWARE
// Run middleware for all queries that start with 'find'
// Hide any tours that should be kept secret to standard users
tourSchema.pre(/^find/, function(next) {
  // .this points to the current query
  this.find({ secretTour: { $ne: true } });
  next();
});

// **AGGREGATION MIDDLEWARE
// Run middleware for all queries that start with 'aggregate'
// Hide any tours that should be kept secret to standard users
tourSchema.pre('aggregate', function(next) {
  //.this points to the current aggregation
  //add a new match filter to the beginning of the pipeline array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// CREATE EXPORT MODEL
const Tour = mongoose.model('Tour', tourSchema);

// EXPORT THIS MODULE
module.exports = Tour;
