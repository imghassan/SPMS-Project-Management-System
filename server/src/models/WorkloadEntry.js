const mongoose = require('mongoose');

const workloadEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },

    hoursSpent: {
        type: Number,
        default: 0
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board' // In this system, boards seem to represent projects or workspace divisions
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card' // Cards represent tasks in the Kanban system
    }
}, { timestamps: true });

module.exports = mongoose.model('WorkloadEntry', workloadEntrySchema);
