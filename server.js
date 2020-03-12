// IMPORT MODULES
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// SET CONFIGURATION PATH
dotenv.config({ path: './config.env' });
const app = require('./app');

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

// START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
