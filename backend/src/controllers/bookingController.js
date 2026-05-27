const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

const populateBooking = (query) =>
  query
    .populate('spotId', 'location spotType pricePerHour ownerId images')
    .populate('userId', 'name email phone role');

exports.createBooking = async (req, res) => {
  try {
    const { spotId, startTime, endTime, vehicleInfo, specialRequests, paymentMethod, paymentReference, paymentStatus } = req.body;

    if (!spotId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const spot = await ParkingSpot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end - start) / (1000 * 60 * 60);

    if (duration <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const totalPrice = duration * spot.pricePerHour;

    const booking = new Booking({
      userId: req.userId,
      spotId,
      startTime: start,
      endTime: end,
      duration,
      totalPrice,
      vehicleInfo,
      specialRequests,
      paymentMethod: paymentMethod || 'UPI',
      paymentReference: paymentReference || `PAY-${Date.now()}`,
      paymentStatus: paymentStatus || 'paid',
      status: paymentStatus === 'failed' ? 'pending' : 'confirmed',
    });

    await booking.save();
    await populateBooking(Booking.findById(booking._id));
    const savedBooking = await Booking.findById(booking._id).populate('spotId', 'location spotType pricePerHour ownerId images').populate('userId', 'name email phone role');

    res.status(201).json({
      message: 'Booking created successfully',
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await populateBooking(Booking.find({ userId: req.userId }).sort({ createdAt: -1 }));

    res.status(200).json({
      message: 'Bookings retrieved successfully',
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerSpots = await ParkingSpot.find({ ownerId: req.userId }).select('_id');
    const bookings = await populateBooking(
      Booking.find({ spotId: { $in: ownerSpots.map((spot) => spot._id) } }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      message: 'Owner bookings retrieved successfully',
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadBookingPhotos = async (req, res) => {
  try {
    const { photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one photo' });
    }

    const booking = await Booking.findById(req.params.id).populate('spotId', 'ownerId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const spotOwnerId = booking.spotId.ownerId?.toString();
    if (spotOwnerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to upload photos for this booking' });
    }

    booking.ownerPhotos = [...new Set([...(booking.ownerPhotos || []), ...photos])];
    await booking.save();

    res.status(200).json({
      message: 'Photos uploaded successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const updatedBooking = await populateBooking(
      Booking.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
    );

    res.status(200).json({
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
