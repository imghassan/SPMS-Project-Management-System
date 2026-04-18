const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Automatically delete invitation after 7 days
    }
});

invitationSchema.pre('validate', async function () {
    if (!this.recipient && !this.email) {
        throw new Error('Please provide either a recipient ID or an email address');
    }
});

module.exports = mongoose.model('Invitation', invitationSchema);
