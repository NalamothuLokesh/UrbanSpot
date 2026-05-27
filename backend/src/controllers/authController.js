const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Register endpoint hit with body:', req.body);
    const { name, email, password, phone, role } = req.body;

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Prevent public creation of admin accounts: require server-side ADMIN_SECRET
    if (role === 'admin') {
      const provided = req.body.adminSecret;
      if (!process.env.ADMIN_SECRET || provided !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Admin registration requires a valid admin secret' });
      }
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'renter',
    });

    await user.save();
    console.log('New user created:', user._id, user.email);

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
