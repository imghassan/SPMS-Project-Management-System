const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const parseProjectBody = (body) => {
  const {
    name,
    description,
    status,
    progress,
    startDate,
    dueDate,
    assignees,
    members,
    lead,
    isArchived
  } = body || {};

  const update = {};
  if (typeof name === 'string') update.name = name;
  if (typeof description === 'string') update.description = description;
  if (typeof status === 'string') update.status = status;
  if (progress !== undefined) update.progress = Number(progress);
  if (startDate !== undefined) update.startDate = startDate ? new Date(startDate) : null;
  if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null;
  if (assignees !== undefined) update.assignees = assignees;
  if (members !== undefined) update.members = members;
  if (lead !== undefined) update.lead = lead;
  if (isArchived !== undefined) update.isArchived = Boolean(isArchived);

  return update;
};

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({
      $or: [{ admin: userId }, { members: userId }, { lead: userId }]
    })
      .populate('admin', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .populate('lead', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    // Retroactively patch any broken statuses
    const patchedProjects = projects.map(p => {
      if (p.progress >= 100 && p.status !== 'COMPLETED' && p.status !== 'DONE') {
        p.status = 'COMPLETED';
        p.isArchived = true;
      }
      return p;
    });

    res.json({ success: true, data: patchedProjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .populate('lead', 'name email avatar role')
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Retroactively patch any broken statuses
    if (project.progress >= 100 && project.status !== 'COMPLETED' && project.status !== 'DONE') {
      project.status = 'COMPLETED';
      project.isArchived = true;
    }

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const payload = parseProjectBody(req.body);
    if (!payload.name || !payload.name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    let project = await Project.create({
      name: payload.name.trim(),
      description: payload.description || '',
      status: payload.status || 'IN PROGRESS',
      progress: payload.progress ?? 0,
      startDate: payload.startDate ?? null,
      dueDate: payload.dueDate ?? null,
      admin: payload.lead || req.user.id,
      lead: payload.lead || req.user.id,
      members: Array.isArray(payload.members) ? payload.members : [],
      isArchived: payload.isArchived ?? false
    });

    project = await project.populate('admin', 'name email avatar role');
    project = await project.populate('members', 'name email avatar role');
    project = await project.populate('lead', 'name email avatar role');

    res.status(201).json({ success: true, data: project });

    // Notify members
    const notifyMembers = project.members.filter(m => m._id.toString() !== req.user.id.toString());
    if (notifyMembers.length > 0) {
      const notifications = notifyMembers.map(member => ({
        recipient: member._id,
        sender: req.user.id,
        type: 'project_added',
        title: 'Added to New Project',
        message: `You have been added to: ${project.name}`,
        link: `/project/${project._id}`
      }));
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only the Admin can update the project
    if (existingProject.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project Admin can update this project' });
    }

    const update = parseProjectBody(req.body);
    if (update.lead) update.admin = update.lead;

    if (update.progress === 100) {
      update.status = 'COMPLETED';
    } else if (update.progress !== undefined && update.progress < 100) {
      if ((existingProject.status === 'DONE' || existingProject.status === 'COMPLETED') && !update.status) {
        update.status = 'IN PROGRESS';
      }
    }

    const project = await Project.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    })
      .populate('admin', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .populate('lead', 'name email avatar role');

    res.json({ success: true, data: project });

    // Notify members of update
    const notifyMembers = project.members.filter(m => m._id.toString() !== req.user.id.toString());
    if (notifyMembers.length > 0) {
      const notifications = notifyMembers.map(member => ({
        recipient: member._id,
        sender: req.user.id,
        type: 'project_updated',
        title: 'Project Updated',
        message: `${project.name} has been updated.`,
        link: `/project/${project._id}`
      }));
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only the Admin can delete the project
    if (existingProject.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project Admin can delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/projects/stats
exports.getProjectStats = async (req, res) => {
  try {
    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(now.getDate() + 7);

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userFilter = {
      $or: [{ admin: userId }, { members: userId }]
    };

    const statsArray = await Project.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activeNow: {
            $sum: { $cond: [{ $and: [{ $eq: ['$status', 'IN PROGRESS'] }, { $ne: ['$isArchived', true] }] }, 1, 0] }
          },
          dueThisWeek: {
            $sum: { $cond: [{ $and: [{ $gte: ['$dueDate', now] }, { $lte: ['$dueDate', in7Days] }, { $ne: ['$status', 'COMPLETED'] }, { $ne: ['$status', 'DONE'] }, { $ne: ['$isArchived', true] }] }, 1, 0] }
          },
          done: {
            $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'DONE']] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = statsArray[0] || { total: 0, activeNow: 0, dueThisWeek: 0, done: 0 };

    res.json({
      success: true,
      data: {
        total: stats.total,
        activeNow: stats.activeNow,
        dueThisWeek: stats.dueThisWeek,
        done: stats.done
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/projects/:id/members/:userId
// Only the project Admin can remove members
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only the Admin can remove members
    if (project.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project Admin can remove members' });
    }

    const targetUserId = req.params.userId;

    // Cannot remove yourself (Admin)
    if (targetUserId === project.admin.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project Admin' });
    }

    // Remove from members array
    project.members = project.members.filter(m => m.toString() !== targetUserId);
    await project.save();

    // Unassign tasks assigned to this member within this project
    await Task.updateMany(
      { project: project._id, assignee: targetUserId },
      { $set: { assignee: null } }
    );

    const updated = await Project.findById(project._id)
      .populate('admin', 'name email avatar role')
      .populate('members', 'name email avatar role');

    res.json({ success: true, data: updated });

    // Notify the removed user
    await Notification.create({
      recipient: targetUserId,
      sender: req.user.id,
      type: 'project_updated',
      title: 'Removed from Project',
      message: `You have been removed from: ${project.name}`,
      link: `/project/${project._id}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/projects/my-team
// Fetch all unique users from all projects the current user is involved in
exports.getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find projects where the current user is an admin, member, or lead
    const projects = await Project.find({
      $or: [{ admin: userId }, { members: userId }, { lead: userId }]
    })
      .populate('admin', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .populate('lead', 'name email avatar role')
      .lean();

    const usersMap = new Map();
    
    // Always include the current user in the team list
    // (They might not be in any project yet, or we want them to be able to select themselves)
    const currentUser = await require('../models/User').findById(userId).select('name email avatar role').lean();
    if (currentUser) {
      usersMap.set(userId.toString(), currentUser);
    }

    // Add all unique users from projects
    projects.forEach(p => {
      // Collect admin, lead, and members
      const projectUsers = [];
      if (p.admin) projectUsers.push(p.admin);
      if (p.lead) projectUsers.push(p.lead);
      if (p.members) projectUsers.push(...p.members);

      projectUsers.forEach(u => {
        if (u && u._id) {
          usersMap.set(u._id.toString(), u);
        }
      });
    });

    const team = Array.from(usersMap.values());
    res.json({ success: true, data: team });
  } catch (err) {
    console.error('[getMyTeam] Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
