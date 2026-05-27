const express = require('express');
const router = express.Router();
const { seedDemoData } = require('../controllers/seedController');

router.post('/', seedDemoData);

module.exports = router;
