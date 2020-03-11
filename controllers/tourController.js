const fs = require('fs'); //file system

// read JSON file (synchronous) and parse it
const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  if (parseInt(val) > tourData.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res
      .status(404)
      .json({ status: 'fail', message: 'Missing name or price...' });
  next();
};

exports.getAllTours = (req, res) => {
  //specify status code and send back JSON data
  res.status(200).json({
    status: 'success',
    //Send length JSON array to client
    reqedAt: req.reqTime,
    results: tourData.length,
    //send data to the client
    data: {
      tours: tourData
    }
  });
};

exports.getTour = (req, res) => {
  //convert id string to int and find the corresponding item in the tourData array
  const id = parseInt(req.params.id);

  const tour = tourData.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  //create new id for object
  //get id of last item in the tourData array and add 1 to it
  const newId = tourData[tourData.length - 1].id + 1;
  //merge the new id into the JSON object
  const newTour = Object.assign({ id: newId }, req.body);
  //push the tour to the array
  tourData.push(newTour);

  //Write new tour to JSON file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tourData),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: {
      tour: '<Tour deleted...>'
    }
  });
};
