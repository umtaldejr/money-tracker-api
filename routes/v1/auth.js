const express = require('express');
const AuthController = require('../../controllers/authController');
const AuthMiddleware = require('../../middleware/auth');

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/me', AuthMiddleware.authenticate, AuthController.me);

module.exports = router;
