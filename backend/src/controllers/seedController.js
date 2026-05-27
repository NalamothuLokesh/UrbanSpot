const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');

const demoParkingSpots = [
  {
    location: {
      address: '12 Eagle Lane',
      city: 'Bengaluru',
      zipCode: '560001',
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
    },
    spotType: 'covered',
    pricePerHour: 80,
    pricePerDay: 450,
    pricePerMonth: 7500,
    amenities: ['cctv', 'lighting', 'covered'],
    description: 'Secure covered parking near a metro station and shopping district.',
    rating: 4.8,
  },
  {
    location: {
      address: '45 Maple Avenue',
      city: 'Bengaluru',
      zipCode: '560017',
      coordinates: { latitude: 12.9461, longitude: 77.6239 },
    },
    spotType: 'garage',
    pricePerHour: 120,
    pricePerDay: 650,
    pricePerMonth: 9800,
    amenities: ['cctv', 'ev-charging', 'covered'],
    description: 'Indoor garage parking with EV charging and 24/7 access.',
    rating: 4.9,
  },
  {
    location: {
      address: '8 Skyline Plaza',
      city: 'Hyderabad',
      zipCode: '500081',
      coordinates: { latitude: 17.3850, longitude: 78.4867 },
    },
    spotType: 'open',
    pricePerHour: 55,
    pricePerDay: 320,
    pricePerMonth: 5600,
    amenities: ['lighting'],
    description: 'Bright open parking close to the business district and cafes.',
    rating: 4.6,
  },
];

exports.seedDemoData = async (req, res) => {
  try {
    let owner = await User.findOne({ email: 'owner@urbanspot.com' });

    if (!owner) {
      owner = await User.create({
        name: 'UrbanSpot Demo Owner',
        email: 'owner@urbanspot.com',
        password: 'demo123456',
        phone: '9999999999',
        role: 'owner',
      });
    }

    const existingSpots = await ParkingSpot.find({ ownerId: owner._id });
    if (existingSpots.length > 0) {
      return res.status(200).json({
        message: 'Demo parking spots already exist',
        count: existingSpots.length,
      });
    }

    const spots = await ParkingSpot.insertMany(
      demoParkingSpots.map((spot) => ({
        ...spot,
        ownerId: owner._id,
      }))
    );

    res.status(201).json({
      message: 'Demo parking spots seeded successfully',
      count: spots.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
