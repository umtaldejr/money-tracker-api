const express = require('express');
const UsersController = require('../../controllers/usersController');
const ValidationMiddleware = require('../../middleware/validation');
const AuthMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/',
  AuthMiddleware.authenticate,
  UsersController.getAllUsers
);

router.get('/:id',
  ValidationMiddleware.validateObjectId,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserOwnership,
  UsersController.getUserById
);

router.post('/', UsersController.createUser);

router.put('/:id',
  ValidationMiddleware.validateObjectId,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserOwnership,
  UsersController.updateUser
);

router.delete('/:id',
  ValidationMiddleware.validateObjectId,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserOwnership,
  UsersController.deleteUser
);

module.exports = router;
