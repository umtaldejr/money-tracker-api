const express = require('express');
const UsersController = require('../../controllers/usersController');
const validateObjectId = require('../../middleware/validateObjectId');
const authenticate = require('../../middleware/authenticate');
const requireOwner = require('../../middleware/requireOwner');

const router = express.Router();

router.get('/',
  authenticate,
  UsersController.getAllUsers
);

router.get('/:id',
  validateObjectId,
  authenticate,
  requireOwner,
  UsersController.getUserById
);

router.post('/', UsersController.createUser);

router.put('/:id',
  validateObjectId,
  authenticate,
  requireOwner,
  UsersController.updateUser
);

router.delete('/:id',
  validateObjectId,
  authenticate,
  requireOwner,
  UsersController.deleteUser
);

module.exports = router;
