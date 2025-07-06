const express = require('express');
const InfoController = require('../../controllers/infoController');
const router = express.Router();

router.get('/', InfoController.getV1ApiInfo);

module.exports = router;
