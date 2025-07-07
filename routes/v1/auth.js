const express = require('express');
const AuthController = require('../../controllers/authController');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);

module.exports = router;
