const express = require('express');
const UsersController = require('../../controllers/usersController');
const ValidationMiddleware = require('../../middleware/validation');

const router = express.Router();

router.get('/', UsersController.getAllUsers);

router.get('/:id',
  ValidationMiddleware.validateObjectId,
  UsersController.getUserById
);

router.post('/',
  UsersController.createUser
);

router.put('/:id',
  ValidationMiddleware.validateObjectId,
  UsersController.updateUser
);

router.delete('/:id',
  ValidationMiddleware.validateObjectId,
  UsersController.deleteUser
);

module.exports = router;
