const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      location,
      role,
      department,
      skills,
      officeLocation
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      password,
      phone,
      location,
      role,
      department,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      officeLocation
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // User is added to req by protect middleware (to be implemented)
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, location, role, department, skills, officeLocation } = req.body;

    const fieldsToUpdate = {};
    if (fullName) fieldsToUpdate.name = fullName;
    if (email) fieldsToUpdate.email = email;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (location !== undefined) fieldsToUpdate.location = location;
    if (role !== undefined) fieldsToUpdate.role = role;
    if (department !== undefined) fieldsToUpdate.department = department;
    if (skills !== undefined) {
      fieldsToUpdate.skills = typeof skills === 'string'
        ? skills.split(',').filter(s => s.trim()).map(s => s.trim())
        : Array.isArray(skills) ? skills : [];
    }
    if (officeLocation !== undefined) fieldsToUpdate.officeLocation = officeLocation;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload user avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirm password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// @desc    Remove user avatar
// @route   DELETE /api/auth/avatar
// @access  Private
exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: 'default-avatar.png' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Helper to format user response
const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    department: user.department,
    phone: user.phone,
    location: user.location,
    skills: user.skills,
    officeLocation: user.officeLocation,
    createdAt: user.createdAt
  };
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: formatUser(user)
  });
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    // Only admins can delete users
    if (!req.user.role || req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can remove team members.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: err.message || 'Server Error' });
  }
};
