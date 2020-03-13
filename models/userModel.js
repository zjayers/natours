// IMPORT MODULES
const mongoose = require('mongoose');
const validator = require('validator');

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
    minlength: [8, 'A password must have greater or equal to 8 characters']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password']
  }
});

// CREATE EXPORT MODEL
const User = mongoose.model('User', userSchema);

// EXPORT THIS MODULE
module.exports = User;
