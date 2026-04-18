const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

const TASK_POPULATION = [
  { path: 'assignee', select: 'name avatar' },
  {
    path: 'project',
    select: 'name title color members admin',
    populate: [
      {
        path: 'members',
        select: 'name email avatar role'
      },
      {
        path: 'admin',
        select: 'name email avatar'
      }
    ]
  }
];

// Get all tasks with filters
exports.getTasks = async (req, res) => {
  try {
    const { status, project, priority, startDate, endDate, assignee } = req.query;
    
    // 1. Build user-selected filters
    const filterConditions = [];
    
    if (status) filterConditions.push({ status });
    if (priority) filterConditions.push({ priority });
    if (assignee) filterConditions.push({ assignee });
    
    // Date range filter on dueDate
    if (startDate || endDate) {
      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      filterConditions.push({ dueDate: dateQuery });
    }
    
    if (project) {
      filterConditions.push({ project });
    }

    // 2. Build system visibility rules
    let visibilityConditions = [];
    if (req.user && req.user.id) {
       // Get all projects where user is involved
       const userProjects = await Project.find({
         $or: [
           { admin: req.user.id },
           { members: req.user.id },
           { lead: req.user.id }
         ]
       }).select('_id');
       const projectIds = userProjects.map(p => p._id);
       
       visibilityConditions = [
         { project: { $in: projectIds } },
         { assignee: req.user.id }
       ];
    }

    // 3. Combine everything into a single query
    const finalQuery = {};
    if (filterConditions.length > 0) {
      finalQuery.$and = filterConditions;
    }
    if (visibilityConditions.length > 0) {
      if (finalQuery.$and) {
        finalQuery.$and.push({ $or: visibilityConditions });
      } else {
        finalQuery.$or = visibilityConditions;
      }
    }

    const tasks = await Task.find(finalQuery)
      .populate(TASK_POPULATION)
      .sort({ order: 1, createdAt: -1 });

    if (req.query.grouped === 'true') {
      const grouped = {
        'To Do': tasks.filter(t => t.status === 'To Do'),
        'In Progress': tasks.filter(t => t.status === 'In Progress'),
        'In Review': tasks.filter(t => t.status === 'In Review'),
        'Done': tasks.filter(t => ['Done'].includes(t.status)),
      };
      return res.json({ success: true, data: grouped });
    }

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate(TASK_POPULATION);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Task not found' });
  }
};

// Create task — only the project Admin can create tasks
exports.createTask = async (req, res) => {
  try {
    const { title, project } = req.body;

    // Permission: only project Admin can create tasks
    const parentProject = await Project.findById(project);
    if (!parentProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (parentProject.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project Admin can create tasks' });
    }

    // Check for duplicate title in the same project (case-insensitive)
    const duplicate = await Task.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
      project: project
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A task with this title already exists in this project.'
      });
    }

    const task = new Task(req.body);
    let newTask = await task.save();

    // Populate the new task
    newTask = await Task.findById(newTask._id).populate(TASK_POPULATION);

    // Notify assignee if present
    if (newTask.assignee) {
      // Ensure we format the ID string properly, extracting if it happens to be heavily populated
      const recipientId = typeof newTask.assignee === 'object' && newTask.assignee._id
        ? newTask.assignee._id
        : newTask.assignee;

      await Notification.create({
        recipient: recipientId,
        sender: req.user?.id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${newTask.title}`,
        link: `/project/${newTask.project?._id || newTask.project}?taskId=${newTask._id}`
      });
    }

    res.status(201).json({ success: true, data: newTask });

    // Sync project progress
    syncProjectProgress(project);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Upload attachment
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileData = {
      name: req.file.originalname,
      size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : (req.file.mimetype === 'application/pdf' ? 'pdf' : 'other'),
      url: `/uploads/${req.file.filename}`
    };

    res.json({ success: true, data: fileData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task — project Admin OR task assignee can update
exports.updateTask = async (req, res) => {
  try {
    const { title, project } = req.body;

    // Permission: only project Admin or task assignee can update
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    const parentProject = await Project.findById(currentTask.project);
    const isAdmin = parentProject && parentProject.admin.toString() === req.user.id.toString();
    const isAssignee = currentTask.assignee && currentTask.assignee.toString() === req.user.id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Only the project Admin or task assignee can update this task' });
    }

    // Check for duplicate if title or project is being changed
    if (title || project) {
      const checkTitle = title || currentTask.title;
      const checkProject = project || currentTask.project;

      const duplicate = await Task.findOne({
        _id: { $ne: req.params.id },
        title: { $regex: new RegExp(`^${checkTitle.trim()}$`, 'i') },
        project: checkProject
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A task with this title already exists in this project.'
        });
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(TASK_POPULATION);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Notify if assignee changed or status updated to Done
    if (req.body.assignee) {
      const recipientId = typeof req.body.assignee === 'object' && req.body.assignee._id
        ? req.body.assignee._id
        : req.body.assignee;

      await Notification.create({
        recipient: recipientId,
        sender: req.user?.id,
        type: 'task_assigned',
        title: 'Task Assignment Updated',
        message: `You have been assigned to: ${task.title}`,
        link: `/project/${task.project?._id || task.project}?taskId=${task._id}`
      });
    }

    res.json({ success: true, data: task });

    // Sync project progress
    syncProjectProgress(task.project);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    const parentProject = await Project.findById(currentTask.project);
    const isAdmin = parentProject && parentProject.admin.toString() === req.user.id.toString();
    const isAssignee = currentTask.assignee && currentTask.assignee.toString() === req.user.id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Only the project Admin or task assignee can update this task' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate(TASK_POPULATION);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });

    // Sync project progress
    syncProjectProgress(task.project);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Toggle subtask completion
exports.toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const parentProject = await Project.findById(task.project);
    const isAdmin = parentProject && parentProject.admin.toString() === req.user.id.toString();
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Only the project Admin or task assignee can update this task' });
    }

    const subtask = task.subtasks.id(req.params.subId);
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' });

    subtask.completed = !subtask.completed;

    await task.save();
    const updatedTask = await Task.findById(task._id).populate(TASK_POPULATION);
    res.json({ success: true, data: updatedTask });

    // Sync project progress (Task updated via subtasks)
    syncProjectProgress(task.project);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add comment to task
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const parentProject = await Project.findById(task.project);
    const isMember = parentProject && (
      parentProject.admin.toString() === req.user.id.toString() ||
      parentProject.members.some(m => m.toString() === req.user.id.toString())
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Only project members can comment on this task' });
    }

    task.comments.push(req.body);
    await task.save();
    res.json({ success: true, data: task });

    // Notify assignee and Admin of comment
    const recipients = new Set();
    if (task.assignee && task.assignee._id) recipients.add(task.assignee._id.toString());
    // Admin is not directly on task model, but we might know it from project.
    // Assuming for now we notify the assignee if someone else comments.
    const notifyRecipients = [...recipients].filter(r => r !== req.user.id.toString());

    if (notifyRecipients.length > 0) {
      await Notification.insertMany(notifyRecipients.map(r => ({
        recipient: r,
        sender: req.user.id,
        type: 'comment_added',
        title: 'New Comment',
        message: `Someone commented on your task: ${task.title}`,
        link: `/project/${task.project?._id || task.project}?taskId=${task._id}`
      })));
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mark task as Done
exports.completeTask = async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const parentProject = await Project.findById(existingTask.project);
    const isAdmin = parentProject && parentProject.admin.toString() === req.user.id.toString();
    const isAssignee = existingTask.assignee && existingTask.assignee.toString() === req.user.id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Only the project Admin or task assignee can update this task' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'Done' },
      { new: true }
    ).populate(TASK_POPULATION);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Notify of task Done status
    if (task.assignee && task.assignee._id && task.assignee._id.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: task.assignee._id,
        sender: req.user?.id,
        type: 'task_done',
        title: 'Task Done',
        message: `Task has been marked as Done: ${task.title}`,
        link: `/project/${task.project?._id || task.project}?taskId=${task._id}`
      });
    }

    res.json({ success: true, data: task });

    // Sync project progress
    syncProjectProgress(task.project);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Toggle Done (legacy/board support)
exports.toggleComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const parentProject = await Project.findById(task.project);
    const isAdmin = parentProject && parentProject.admin.toString() === req.user.id.toString();
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Only the project Admin or task assignee can update this task' });
    }

    const isCurrentlyDone = ['Done', 'Done'].includes(task.status);
    task.status = isCurrentlyDone ? 'To Do' : 'Done';

    await task.save();
    const updatedTask = await Task.findById(task._id).populate(TASK_POPULATION);
    res.json({ success: true, data: updatedTask });

    // Sync project progress
    syncProjectProgress(updatedTask.project);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete task — only project Admin can delete tasks
exports.deleteTask = async (req, res) => {
  try {
    const taskToDelete = await Task.findById(req.params.id);
    if (!taskToDelete) return res.status(404).json({ message: 'Task not found' });

    // Permission: only project Admin can delete tasks
    const parentProject = await Project.findById(taskToDelete.project);
    if (!parentProject || parentProject.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project Admin can delete tasks' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });

    // Sync project progress
    if (task && task.project) {
      syncProjectProgress(task.project);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task statistics
exports.getStats = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user && req.user.id) {
      const userProjects = await Project.find({
        $or: [{ admin: req.user.id }, { members: req.user.id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      matchQuery = {
        $or: [
          { project: { $in: projectIds } },
          { assignee: req.user.id }
        ]
      };
    }

    const now = new Date();

    const [total, completed, active, overdue] = await Promise.all([
      Task.countDocuments(matchQuery),
      Task.countDocuments({ ...matchQuery, status: { $in: ['Done'] } }),
      Task.countDocuments({ ...matchQuery, status: { $in: ['To Do', 'In Progress', 'In Review'] } }),
      Task.countDocuments({
        ...matchQuery,
        status: { $nin: ['Done'] },
        dueDate: { $lt: new Date() }
      })
    ]);

    res.json({ total, done: completed, active, overdue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder tasks
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // Expecting array of { id, order }

    const bulkOps = tasks.map(t => ({
      updateOne: {
        filter: { _id: t.id },
        update: { $set: { order: t.order } }
      }
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Tasks reordered successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Helper to calculate compatibility scores for users against a task using smart keyword matching
function getScoredMembers(taskData, users) {
  if (!users || !Array.isArray(users)) return [];

  const { title, description } = taskData;
  const taskText = `${title || ''} ${description || ''}`.toLowerCase();

  return users.map(user => {
    let score = 0;
    let hasMatch = false;
    const userSkills = user.skills || [];
    const userRole = (user.role || '').toLowerCase();
    const userDept = (user.department || '').toLowerCase();

    // 1. Role match (High weight)
    // If the task title/description contains the user's role name
    if (userRole && userRole !== 'generalist') {
      const escapedRole = userRole.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const roleRegex = new RegExp(`\\b${escapedRole}\\b`, 'i');
      if (roleRegex.test(taskText)) {
        score += 30;
        hasMatch = true;
      }
    }

    // 2. Department match (Medium weight)
    if (userDept && userDept !== 'general') {
      const escapedDept = userDept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const deptRegex = new RegExp(`\\b${escapedDept}\\b`, 'i');
      if (deptRegex.test(taskText)) {
        score += 15;
        hasMatch = true;
      }
    }

    // 3. Skill keyword matching in title/description
    if (userSkills.length > 0) {
      const directMatches = userSkills.filter(skill => {
        if (!skill) return false;
        try {
          const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
          return regex.test(taskText);
        } catch (e) {
          return false;
        }
      });

      if (directMatches.length > 0) {
        score += directMatches.length * 12;
        hasMatch = true;
      }
    }

    // 4. Workload penalty (Negative weight)
    const workload = (user.performanceMetrics && user.performanceMetrics.tasksInProgress) || 0;
    score -= workload * 5;

    // 5. Productivity bonus
    const productivity = (user.performanceMetrics && user.performanceMetrics.productivityScore) || 0;
    score += (productivity / 5);

    return {
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        skills: user.skills,
        department: user.department
      },
      score: Math.max(0, Math.round(score)),
      hasMatch
    };
  }).sort((a, b) => b.score - a.score);
}

// Auto-assign task to a team member based on role and skills
exports.autoAssignTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const availableUsers = await User.find({ availabilityStatus: 'Available' });
    if (!availableUsers.length) {
      return res.status(404).json({ success: false, message: 'No available team members found' });
    }

    const scoredMembers = getScoredMembers({
      title: task.title,
      description: task.description
    }, availableUsers);

    // Filter for users who actually have a relevance match (Role, Dept, or Skill)
    const matchingMembers = scoredMembers.filter(m => m.hasMatch);

    if (matchingMembers.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No team members matching the task content (Role/Dept/Skills) were found. Skipping auto-assignment.'
      });
    }

    const bestMatch = matchingMembers[0].user;

    // Update task assignee
    task.assignee = bestMatch._id;
    const updatedTask = await task.save();

    // Notify the matched user
    await Notification.create({
      recipient: bestMatch._id,
      type: 'task_assigned',
      title: 'Task Auto-Assigned',
      message: `System has auto-assigned you to: ${task.title} (Skill Match Found)`,
      link: `/project/${task.project?._id || task.project}?taskId=${task._id}`
    });

    res.json({
      success: true,
      message: `Task auto-assigned to ${bestMatch.name}`,
      task: updatedTask,
      matchScore: scoredMembers[0].score
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto-suggest the best assignee for a task (before creation)
exports.suggestAssignee = async (req, res) => {
  try {
    const { title, description, requiredRole, requiredSkills } = req.body;

    let availableUsers = await User.find({ availabilityStatus: 'Available' });

    // Fallback: If no users are 'Available', check all users
    if (!availableUsers.length) {
      availableUsers = await User.find({});
    }

    if (!availableUsers.length) {
      return res.status(404).json({ success: false, message: 'No team members found in database.' });
    }

    const scoredMembers = getScoredMembers({
      title, description
    }, availableUsers);

    // Filter for users who actually have a relevance match
    const matchingMembers = scoredMembers.filter(m => m.hasMatch);

    res.json({
      success: true,
      recommendations: matchingMembers.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to sync project progress based on task status
async function syncProjectProgress(projectId) {
  if (!projectId) return;

  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    if (totalTasks === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0, status: 'IN PROGRESS' });
      return;
    }

    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: { $in: ['Done', 'Done'] }
    });

    const progress = Math.round((completedTasks / totalTasks) * 100);
    const status = progress === 100 ? 'COMPLETED' : 'IN PROGRESS';

    await Project.findByIdAndUpdate(projectId, {
      progress,
      status,
      isArchived: progress === 100
    });
  } catch (err) {
    console.error('Error syncing project progress:', err);
  }
}

// Helper to ensure a user is a member of the project
async function ensureProjectMembership(projectId, userId) {
  if (!projectId || !userId) return;
  try {
    // If userId is populated object, extract _id
    const id = (typeof userId === 'object' && userId._id) ? userId._id : userId;

    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { members: id }
    });
  } catch (err) {
    console.error('Error ensuring project membership:', err);
  }
}

