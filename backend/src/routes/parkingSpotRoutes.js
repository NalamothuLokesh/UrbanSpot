const express = require('express');
const router = express.Router();
const parkingSpotController = require('../controllers/parkingSpotController');
const auth = require('../middleware/auth');

router.get('/', parkingSpotController.getAllSpots);
router.get('/:id', parkingSpotController.getSpotById);
router.post('/', auth, parkingSpotController.createSpot);
router.put('/:id', auth, parkingSpotController.updateSpot);
router.delete('/:id', auth, parkingSpotController.deleteSpot);
router.post('/:id/review', auth, parkingSpotController.addReview);

module.exports = router;
