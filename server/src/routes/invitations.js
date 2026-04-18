const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvitation, getPendingInvitations, respondToInvitation } = require('../controllers/invitationController');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

router.post('/', protect, createInvitation);
router.get('/pending', protect, getPendingInvitations);
router.put('/:id/respond', protect, respondToInvitation);

// GET /api/invitations/team-members
// Returns all users invited by the current user (any status) + the current user
router.get('/team-members', protect, async (req, res) => {
  try {
    const senderId = req.user.id;

    // Find all invitations sent by the current user
    const invitations = await Invitation.find({ sender: senderId })
      .populate('recipient', 'name email avatar role department')
      .lean();

    // Collect unique user IDs that have a corresponding user account
    const invitedUsersMap = new Map();
    for (const inv of invitations) {
      if (inv.recipient) {
        const id = inv.recipient._id.toString();
        if (!invitedUsersMap.has(id)) {
          invitedUsersMap.set(id, inv.recipient);
        }
      } else {
        // Try to look up by email for users who registered later
        const user = await User.findOne({ email: inv.email })
          .select('name email avatar role department')
          .lean();
        if (user) {
          const id = user._id.toString();
          if (!invitedUsersMap.has(id)) {
            invitedUsersMap.set(id, user);
          }
        }
      }
    }

    // Always include the current user themselves
    const currentUser = await User.findById(senderId)
      .select('name email avatar role department')
      .lean();
    if (currentUser) {
      invitedUsersMap.set(currentUser._id.toString(), currentUser);
    }

    const members = Array.from(invitedUsersMap.values());
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
