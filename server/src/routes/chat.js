const express = require('express');
const router = express.Router();
const { getChatHistory, deleteMessage, clearChat } = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = 'uploads/teamChat';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitizedName = file.originalname.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
        cb(null, `chat-${Date.now()}-${sanitizedName}`);
    }
});

const upload = multer({ storage });

// @route   GET /api/chat/history
// @desc    Get chat message history
// @access  Private
router.get('/history', protect, getChatHistory);

// @route   POST /api/chat/upload
// @desc    Upload a file for chat
// @access  Private
router.post('/upload', protect, upload.array('file', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
        name: file.originalname,
        originalname: file.originalname,
        url: `/uploads/teamChat/${file.filename}`,
        size: file.size,
        fileType: file.mimetype
    }));

    res.json({
        success: true,
        data: uploadedFiles
    });
});

// @route   DELETE /api/chat/message/:id
// @desc    Delete a message
// @access  Private
router.delete('/message/:id', protect, deleteMessage);

// @route   DELETE /api/chat/clear
// @desc    Clear chat history 
// @access  Private
router.delete('/clear', protect, clearChat);

module.exports = router;

