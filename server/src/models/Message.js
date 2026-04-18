const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ''  // Not required — validation handled at app layer (socket checks content or files)
    },
    files: [{
        name: String,
        url: String,
        size: Number,
        fileType: String
    }],
    file: { // Keep for backward compatibility with old messages
        name: String,
        url: String,
        size: Number,
        fileType: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
