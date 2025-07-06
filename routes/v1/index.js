const express = require('express');
const InfoController = require('../../controllers/infoController');
const router = express.Router();

router.get('/', InfoController.getV1ApiInfo);

router.use('/users', require('./users'));

module.exports = router;
