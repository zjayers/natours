// IMPORT MODULES
const express = require('express'); //express framework
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// MOUNT ROUTER
const router = express.Router();

// *SIGN UP ROUTE
router.post('/signup', authController.signup);
router.post('/login', authController.login);

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
