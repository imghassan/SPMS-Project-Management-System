const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);
router.put('/change-password', protect, changePassword);

// Get all users
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email avatar role department')
      .lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.get('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar role department location phone skills officeLocation')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.delete('/users/:id', protect, deleteUser);

module.exports = router;
