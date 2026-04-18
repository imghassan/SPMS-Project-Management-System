const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['IN PROGRESS', 'ON HOLD', 'COMPLETED'],
      default: 'IN PROGRESS'
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isArchived: { type: Boolean, default: false },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Performance Indexes
projectSchema.index({ admin: 1 });
projectSchema.index({ lead: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ dueDate: 1 });
projectSchema.index({ isArchived: 1 });
// Compound indexes for common dashboard filters
projectSchema.index({ admin: 1, status: 1 });
projectSchema.index({ lead: 1, status: 1 });
projectSchema.index({ members: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);

