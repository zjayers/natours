//import core modules
const fs = require('fs'); //file system
const express = require('express'); //express framework

//init express framework
const app = express();

//init express json middleware
app.use(express.json());

// read JSON file (synchronous) and parse it
const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//TOURS API - GET routing
app.get('/api/v1/tours', (request, response) => {
  //specify status code and send back JSON data
  response.status(200).json({
    status: 'success',
    //Send length JSON array to client
    results: tourData.length,
    //send data to the client
    data: {
      tours: tourData
    }
  });
});

//TOURS API - URL routing
app.get('/api/v1/tours/:id', (request, response) => {
  //convert id string to int and find the corresponding item in the tourData array
  const id = parseInt(request.params.id);

  const tour = tourData.find(el => el.id === id);

  if (!tour) {
    return response.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  response.status(200).json({
    status: 'success',
    data: null
  });
});

//TOURS API - POST routing
app.post('/api/v1/tours', (request, response) => {
  //create new id for object
  //get id of last item in the tourData array and add 1 to it
  const newId = tourData[tourData.length - 1].id + 1;
  //merge the new id into the JSON object
  const newTour = Object.assign({ id: newId }, request.body);
  //push the tour to the array
  tourData.push(newTour);

  //Write new tour to JSON file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tourData),
    err => {
      response.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
});

//TOURS API - patch routing
app.patch('/api/v1/tours/:id', (request, response) => {
  if (parseInt(request.params.id) > tourData.length) {
    return response.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  response.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
});

//TOURS API - Delete routing
app.delete('/api/v1/tours/:id', (request, response) => {
  if (parseInt(request.params.id) > tourData.length) {
    return response.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  response.status(204).json({
    status: 'success',
    data: {
      tour: '<Tour deleted...>'
    }
  });
});

//server vars
const port = 3000;

//start-up server
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
