// IMPORT MODULES
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

// SET CONFIGURATION PATH
dotenv.config({ path: '/Users/zachayers/Desktop/natours/config.env' });

// CONNECT TO CLOUD SERVER CLUSTER
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// INIT MONGOOSE CONNECTION TO THE DATABASE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Database connection successful...');
  });

//READ JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//Import data to database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data uploaded!');
  } catch (error) {
    console.log(error);
  }
};

//Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted!');
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
