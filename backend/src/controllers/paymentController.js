const Stripe = require('stripe');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-08-16' }) : null;

const getPaymentMethodTypes = (paymentMethod) => {
  if (paymentMethod === 'UPI') {
    return ['upi', 'card'];
  }

  return ['card', 'upi'];
};

const buildBookingPayload = (metadata) => ({
  userId: metadata.userId,
  spotId: metadata.spotId,
  startTime: new Date(metadata.startTime),
  endTime: new Date(metadata.endTime),
  duration: Number(metadata.duration),
  totalPrice: Number(metadata.totalPrice),
  vehicleInfo: {
    vehicleType: metadata.vehicleType || '',
    licensePlate: metadata.licensePlate || '',
    color: metadata.color || '',
  },
  specialRequests: metadata.specialRequests || '',
  paymentMethod: metadata.paymentMethod || 'Card',
  paymentReference: metadata.sessionId,
  paymentStatus: 'paid',
  status: 'confirmed',
});

exports.createCheckoutSession = async (req, res) => {
  try {
    // If Stripe is not configured, fall back to creating the booking directly
    if (!stripe) {
      const { spotId, startTime, endTime, vehicleInfo, specialRequests, paymentMethod } = req.body;

      if (!spotId || !startTime || !endTime) {
        return res.status(400).json({ message: 'Please provide all required booking details' });
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

      // Build booking and mark as paid (Stripe disabled temporary)
      const bookingData = buildBookingPayload({
        userId: req.userId,
        spotId,
        startTime,
        endTime,
        duration: String(duration),
        totalPrice: String(totalPrice),
        vehicleType: vehicleInfo?.vehicleType || '',
        licensePlate: vehicleInfo?.licensePlate || '',
        color: vehicleInfo?.color || '',
        specialRequests: specialRequests || '',
        paymentMethod: paymentMethod || 'Offline',
        sessionId: `offline_${Date.now()}`,
      });

      const booking = new Booking(bookingData);
      await booking.save();

      const savedBooking = await Booking.findById(booking._id)
        .populate('spotId', 'location spotType pricePerHour ownerId images')
        .populate('userId', 'name email phone role');

      return res.status(201).json({ message: 'Booking created (Stripe disabled)', data: savedBooking, totalPrice });
    }

    const { spotId, startTime, endTime, vehicleInfo, specialRequests, paymentMethod } = req.body;

    if (!spotId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required booking details' });
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: getPaymentMethodTypes(paymentMethod),
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Parking at ${spot.location.address}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.userId,
        spotId,
        startTime,
        endTime,
        duration: String(duration),
        totalPrice: String(totalPrice),
        vehicleType: vehicleInfo?.vehicleType || '',
        licensePlate: vehicleInfo?.licensePlate || '',
        color: vehicleInfo?.color || '',
        specialRequests: specialRequests || '',
        paymentMethod: paymentMethod || 'Card',
      },
      success_url: `${FRONTEND_URL}/parking-spots?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/parking-spots?payment=cancelled&session_id={CHECKOUT_SESSION_ID}`,
    });

    res.status(200).json({
      message: 'Checkout session created successfully',
      url: session.url,
      sessionId: session.id,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmCheckoutSession = async (req, res) => {
  try {
    // If Stripe is not configured, bookings are created immediately via /checkout
    if (!stripe) {
      return res.status(200).json({ message: 'Stripe disabled: bookings are created directly via checkout endpoint' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Missing Stripe session ID' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment has not been completed yet' });
    }

    const metadata = session.metadata || {};

    if (metadata.userId !== req.userId) {
      return res.status(403).json({ message: 'This payment session does not belong to your account' });
    }

    const existingBooking = await Booking.findOne({ paymentReference: session.id });
    if (existingBooking) {
      const populatedBooking = await Booking.findById(existingBooking._id)
        .populate('spotId', 'location spotType pricePerHour ownerId images')
        .populate('userId', 'name email phone role');

      return res.status(200).json({
        message: 'Booking already confirmed',
        data: populatedBooking,
      });
    }

    const bookingData = buildBookingPayload({
      ...metadata,
      sessionId: session.id,
    });

    const booking = new Booking(bookingData);
    await booking.save();

    const savedBooking = await Booking.findById(booking._id)
      .populate('spotId', 'location spotType pricePerHour ownerId images')
      .populate('userId', 'name email phone role');

    res.status(201).json({
      message: 'Booking confirmed successfully',
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
