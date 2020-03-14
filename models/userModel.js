// IMPORT MODULES
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// CREATE USER SCHEMA
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us you name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'A password must have greater or equal to 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //!THIS VALIDATOR ONLY RUNS ON .CREATE() OR .SAVE()
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: { type: Date }
});

//!PASSWORD ENCRYPTION MIDDLEWARE
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Only run this function if the password has been modified
  this.password = await bcrypt.hash(this.password, 12); //<- 12 is the CPU cost of hashing
  this.passwordConfirm = undefined; // Remove the password confirm from the database - it is only needed for initial validation
  next();
});

//!PASSWORD LOGIN COMPARISON
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//!PASSWORD CHANGED MONITOR
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  //If password has ever been changed - check it against the JWT timestamp
  if (this.passwordChangedAt) {
    //Convert the date to milliseconds, then seconds, then to an integer
    const convertedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // If token was issued before the password changed, return false
    return JWTTimestamp < convertedTimestamp;
  }

  return false;
};

// CREATE EXPORT MODEL
const User = mongoose.model('User', userSchema);

// EXPORT THIS MODULE
module.exports = User;
