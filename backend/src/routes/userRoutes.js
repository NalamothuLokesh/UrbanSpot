const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      message: 'User profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: create another admin account
router.post('/create-admin', auth, async (req, res) => {
  try {
    // Only existing admins may create new admins
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create new admin accounts' });
    }

    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide name, email, password and phone' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    const user = new User({ name, email, password, phone, role: 'admin' });
    await user.save();

    res.status(201).json({ message: 'Admin account created', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
