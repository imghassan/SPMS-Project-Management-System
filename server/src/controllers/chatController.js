const Message = require('../models/Message');

// @route   GET /api/chat/history
// @desc    Get chat message history
// @access  Private
exports.getChatHistory = async (req, res) => {
    try {
        const messages = await Message.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name avatar');

        res.json({
            success: true,
            data: messages.reverse()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @route   DELETE /api/chat/message/:id
// @desc    Delete a message
// @access  Private
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Check ownership
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await message.deleteOne();
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @route   DELETE /api/chat/clear
// @desc    Clear chat hilstory for a team
// @access  Private
exports.clearChat = async (req, res) => {
    try {
        await Message.deleteMany({});
        res.json({ success: true, message: 'Chat cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

