const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['To Do', 'In Progress', 'In Review', 'Done'],
    default: 'To Do'
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  order: {
    type: Number,
    default: 0
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  dueDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  subtasks: [{
    label: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  attachments: [{
    name: String,
    size: String,
    type: { type: String, enum: ['pdf', 'image', 'other'] },
    url: String
  }],
  comments: [{
    author: String,
    initials: String,
    avatar: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  analytics: {

    timeLogged: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastWarningSentAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
