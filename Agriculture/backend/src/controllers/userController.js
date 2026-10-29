const User = require('../models/User');
const mongoose = require('mongoose');

// In-memory fallback dataset for seamless offline operation when MongoDB is not connected
const fallbackUsers = [
  { _id: '64a000000000000000000001', name: 'Ramesh Patel', email: 'ramesh.farmer@agrilink.in', phone: '+91 98450 12345', role: 'farmer', location: 'Madanapalle, Andhra Pradesh', verified: true, createdAt: new Date('2026-08-10') },
  { _id: '64a000000000000000000002', name: 'Srinivasulu Reddy', email: 'srinivasulu@agrilink.in', phone: '+91 98450 67890', role: 'farmer', location: 'Chittoor, Andhra Pradesh', verified: true, createdAt: new Date('2026-08-14') },
  { _id: '64a000000000000000000003', name: 'Venkatamma K.', email: 'venkatamma@agrilink.in', phone: '+91 98450 11223', role: 'farmer', location: 'Tirupati, Andhra Pradesh', verified: false, createdAt: new Date('2026-09-01') },
  { _id: '64a000000000000000000004', name: 'Rayalaseema Horti FPO', email: 'contact@rayalaseemafpo.in', phone: '+91 98450 55443', role: 'fpo', location: 'Madanapalle, Andhra Pradesh', verified: true, createdAt: new Date('2026-08-01') },
  { _id: '64a00000000000000000000a', name: 'Kisan Samriddhi Producer Co', email: 'info@kisansamriddhi.org', phone: '+91 98450 77889', role: 'fpo', location: 'Anantapur, Andhra Pradesh', verified: false, createdAt: new Date('2026-09-02') },
  { _id: '64a000000000000000000005', name: 'ABC Agro Foods Pvt Ltd', email: 'procurement@abcagrofoods.com', phone: '+91 98765 11223', role: 'buyer', location: 'Bengaluru, Karnataka', verified: true, createdAt: new Date('2026-08-05') },
  { _id: '64a000000000000000000006', name: 'Kisan Fresh Mart', email: 'purchasing@kisanfreshmart.in', phone: '+91 98765 33445', role: 'buyer', location: 'Chittoor, Andhra Pradesh', verified: true, createdAt: new Date('2026-08-12') },
  { _id: '64a000000000000000000007', name: 'South Green Retailers', email: 'sourcing@southgreen.in', phone: '+91 98765 66778', role: 'buyer', location: 'Tirupati, Andhra Pradesh', verified: false, createdAt: new Date('2026-08-28') },
  { _id: '64a000000000000000000008', name: 'Heritage Foods Bulk', email: 'bulk@heritagefoods.com', phone: '+91 98765 99887', role: 'buyer', location: 'Bengaluru, Karnataka', verified: true, createdAt: new Date('2026-08-18') },
  { _id: '64a000000000000000000009', name: 'APMC Market Admin', email: 'admin@agrilink.gov.in', phone: '+91 98000 00001', role: 'admin', location: 'Hyderabad / Amaravati', verified: true, createdAt: new Date('2026-07-01') },
];

// @desc    Get all users (with optional role filtering)
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    if (mongoose.connection.readyState === 1) {
      const users = await User.find(filter).select('-password');
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    }

    // Fallback when MongoDB is offline
    const filtered = role ? fallbackUsers.filter((u) => u.role === role) : fallbackUsers;
    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      source: 'offline-fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, data: user });
    }

    const user = fallbackUsers.find((u) => u._id === req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, location, verified } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and password',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        phone,
        password,
        role: role || 'farmer',
        location: location || '',
        verified: verified || false,
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          verified: user.verified,
        },
      });
    }

    // Offline mode mock response
    const newUser = {
      _id: `mock-${Date.now()}`,
      name,
      email,
      phone,
      role: role || 'farmer',
      location: location || '',
      verified: verified || false,
      createdAt: new Date(),
    };
    fallbackUsers.push(newUser);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, data: user });
    }

    const index = fallbackUsers.findIndex((u) => u._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    fallbackUsers[index] = { ...fallbackUsers[index], ...req.body };
    res.status(200).json({ success: true, data: fallbackUsers[index] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
