// IMPORT MODULES
const express = require('express'); //express framework
const userController = require('./../controllers/userController');

// MOUNT ROUTER
const router = express.Router();

// DEFINE THE ROUTES
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// EXPORT ROUTER
module.exports = router;
