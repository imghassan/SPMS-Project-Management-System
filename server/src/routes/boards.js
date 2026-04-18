const express = require('express');
const router = express.Router();
const { createBoard, getBoards } = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBoards);
router.post('/', protect, createBoard);

module.exports = router;
