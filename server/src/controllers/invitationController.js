const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

// POST /api/invitations
// body: { email, role, projectId (optional) }
exports.createInvitation = async (req, res) => {
  try {
    const { email, role, projectId } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent self-invitation
    const currentUser = await User.findById(req.user.id).select('email').lean();
    if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
      return res.status(400).json({ success: false, message: 'You cannot invite yourself. You are already part of your team.' });
    }

    // If user exists, link recipient too (optional)
    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id').lean();

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found. You can only invite existing users.' });
    }

    // Check if user is already in the project
    if (projectId) {
      const project = await Project.findById(projectId).lean();
      if (project) {
        const isMember = project.members.some(m => m.toString() === existingUser._id.toString());
        const isAdmin = project.admin && project.admin.toString() === existingUser._id.toString();
        const isLead = project.lead && project.lead.toString() === existingUser._id.toString();

        if (isMember || isAdmin || isLead) {
          return res.status(400).json({ success: false, message: 'User is already a member of this project.' });
        }
      }

      // Check for existing pending invitation for same project
      const existingInvitation = await Invitation.findOne({
        email: normalizedEmail,
        project: projectId,
        status: 'pending'
      }).lean();

      if (existingInvitation) {
        return res.status(400).json({ success: false, message: 'A pending invitation already exists for this user in this project.' });
      }
    }

    const invitation = await Invitation.create({
      sender: req.user.id,
      recipient: existingUser?._id,
      email: normalizedEmail,
      role: role === 'admin' ? 'admin' : 'member',
      ...(projectId ? { project: projectId } : {}),
      status: 'pending'
    });

    // Notify recipient if they are an existing user
    if (existingUser) {
      await Notification.create({
        recipient: existingUser._id,
        sender: req.user.id,
        type: 'invitation_received',
        title: 'Team Invitation',
        message: `You have been invited to join the team by ${req.user.name || 'a team member'}.`,
        link: `/team`,
        metadata: { invitationId: invitation._id }
      });
    }

    res.status(201).json({ success: true, data: invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/invitations/pending
exports.getPendingInvitations = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    const invitations = await Invitation.find({
      $or: [
        { email: userEmail },
        { recipient: userId }
      ],
      status: 'pending'
    })
      .populate('sender', 'name email avatar')
      .populate('project', 'name description status')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: invitations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/invitations/:id/respond
// body: { status: 'accepted' | 'declined' }
exports.respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status response' });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    // Verify this invitation is for the current user
    const currentUser = await User.findById(req.user.id).select('email').lean();
    const isRecipientId = invitation.recipient && invitation.recipient.toString() === req.user.id;
    const isRecipientEmail = invitation.email && invitation.email.toLowerCase() === currentUser.email.toLowerCase();

    if (!isRecipientId && !isRecipientEmail) {
      return res.status(403).json({ success: false, message: 'You are not authorized to respond to this invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation has already been processed' });
    }

    invitation.status = status;
    await invitation.save();

    // Mark all associated notifications as read
    await Notification.updateMany(
      { 
        recipient: req.user.id, 
        'metadata.invitationId': invitation._id 
      },
      { isRead: true }
    );

    // If accepted and tied to a project, add user to project members
    if (status === 'accepted' && invitation.project) {
      const project = await Project.findById(invitation.project);
      if (project) {
        // Use $addToSet to avoid duplicates
        await Project.findByIdAndUpdate(invitation.project, {
          $addToSet: { members: req.user.id }
        });
      }
    }

    // Notify the sender about the response
    await Notification.create({
      recipient: invitation.sender,
      sender: req.user.id,
      type: 'invitation_responded',
      title: 'Invitation Update',
      message: `${req.user.name || 'A user'} has ${status} your invitation.`,
      link: '/team'
    });

    res.json({ success: true, data: invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
