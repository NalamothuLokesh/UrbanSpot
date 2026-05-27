const ParkingSpot = require('../models/ParkingSpot');

exports.getAllSpots = async (req, res) => {
  try {
    const { city, priceMin, priceMax, spotType } = req.query;
    let query = {};

    if (city) query['location.city'] = city;
    if (spotType) query.spotType = spotType;
    if (priceMin || priceMax) {
      query.pricePerHour = {};
      if (priceMin) query.pricePerHour.$gte = Number(priceMin);
      if (priceMax) query.pricePerHour.$lte = Number(priceMax);
    }

    // Hide admin-only spots for non-admin users
    if (req.userRole !== 'admin') {
      query.isAdminOnly = { $ne: true };
    }

    const spots = await ParkingSpot.find(query)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Parking spots retrieved successfully',
      count: spots.length,
      data: spots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSpotById = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .populate('reviews.userId', 'name');

    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // If spot is admin-only, only admins can view
    if (spot.isAdminOnly && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Parking spot not found' });
    }

    res.status(200).json({
      message: 'Parking spot retrieved successfully',
      data: spot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSpot = async (req, res) => {
  try {
    // Only users with role 'owner' or 'admin' should be allowed to create/list parking spots
    if (req.userRole !== 'owner' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only owners or admins can create parking spots' });
    }
    const { location, spotType, pricePerHour, pricePerDay, pricePerMonth, amenities, description } = req.body;

    if (!location || !spotType || !pricePerHour || !pricePerDay || !pricePerMonth) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const spotData = {
      ownerId: req.userId,
      location,
      spotType,
      pricePerHour,
      pricePerDay,
      pricePerMonth,
      amenities,
      description,
    };

    // If admin creates a spot and sets adminOnly flag, mark it private
    if (req.userRole === 'admin' && req.body.adminOnly) {
      spotData.isAdminOnly = true;
    }

    const spot = new ParkingSpot(spotData);

    await spot.save();
    await spot.populate('ownerId', 'name email phone');

    res.status(201).json({
      message: 'Parking spot created successfully',
      data: spot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSpot = async (req, res) => {
  try {
    let spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    if (spot.ownerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this spot' });
    }

    spot = await ParkingSpot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('ownerId', 'name email phone');

    res.status(200).json({
      message: 'Parking spot updated successfully',
      data: spot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    if (spot.ownerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this spot' });
    }

    await ParkingSpot.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Parking spot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    const review = {
      userId: req.userId,
      rating,
      comment,
    };

    spot.reviews.push(review);
    spot.rating = (spot.reviews.reduce((sum, r) => sum + r.rating, 0) / spot.reviews.length).toFixed(1);

    await spot.save();

    res.status(201).json({
      message: 'Review added successfully',
      data: spot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
