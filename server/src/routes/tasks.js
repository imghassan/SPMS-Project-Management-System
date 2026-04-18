const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Public/Common routes (should come before parameterized :id routes)
router.get('/', protect, taskController.getTasks);
router.get('/stats', protect, taskController.getStats);
router.post('/suggest-assignee', protect, taskController.suggestAssignee);
router.post('/upload', protect, require('../config/multer').single('file'), taskController.uploadAttachment);

// Task creation
router.post('/', protect, taskController.createTask);

// Task-specific reordering
router.patch('/reorder', protect, taskController.reorderTasks);

// Parameterized routes
router.get('/:id', protect, taskController.getTaskById);
router.put('/:id', protect, taskController.updateTask);
router.patch('/:id/status', protect, taskController.updateTaskStatus);
router.patch('/:id/subtasks/:subId', protect, taskController.toggleSubtask);
router.post('/:id/comments', protect, taskController.addComment);
router.patch('/:id/complete', protect, taskController.toggleComplete);
router.post('/:id/auto-assign', protect, taskController.autoAssignTask);
router.delete('/:id', protect, taskController.deleteTask);

module.exports = router;
