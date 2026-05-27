const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    spotType: {
      type: String,
      enum: ['covered', 'open', 'garage'],
      required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 1,
    },
    amenities: [
      {
        type: String,
        enum: ['cctv', 'lighting', 'covered', 'ev-charging', 'reserved'],
      },
    ],
    images: [String],
    isAdminOnly: {
      type: Boolean,
      default: false,
    },
    description: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
