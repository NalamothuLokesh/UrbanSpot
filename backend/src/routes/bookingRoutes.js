const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingController.createBooking);
router.get('/', auth, bookingController.getBookings);
router.get('/owner', auth, bookingController.getOwnerBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.put('/:id', auth, bookingController.updateBooking);
router.post('/:id/photos', auth, bookingController.uploadBookingPhotos);
router.post('/:id/cancel', auth, bookingController.cancelBooking);

module.exports = router;
