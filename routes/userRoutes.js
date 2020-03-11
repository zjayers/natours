const express = require('express'); //express framework
const userController = require('./../controllers/userController');

//USER ROUTING - mount new router
const router = express.Router();

//USER ROUTING
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
