const express = require('express');
const UsersController = require('../../controllers/usersController');
const validateObjectId = require('../../middleware/validateObjectId');
const authenticate = require('../../middleware/authenticate');
const checkUserOwnership = require('../../middleware/checkUserOwnership');

const router = express.Router();

router.get('/',
  authenticate,
  UsersController.getAllUsers
);

router.get('/:id',
  validateObjectId,
  authenticate,
  checkUserOwnership,
  UsersController.getUserById
);

router.post('/', UsersController.createUser);

router.put('/:id',
  validateObjectId,
  authenticate,
  checkUserOwnership,
  UsersController.updateUser
);

router.delete('/:id',
  validateObjectId,
  authenticate,
  checkUserOwnership,
  UsersController.deleteUser
);

module.exports = router;
