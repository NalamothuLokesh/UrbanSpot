const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpot',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    vehicleInfo: {
      licensePlate: String,
      vehicleType: String,
      color: String,
    },
    specialRequests: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: String,
    paymentReference: String,
    ownerPhotos: [String],
    paymentId: mongoose.Schema.Types.ObjectId,
    cancellationReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
