const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  removeMember,
  getMyTeam
} = require('../controllers/projectController');

router.get('/', protect, getProjects);
router.get('/my-team', protect, getMyTeam);
router.get('/stats', protect, getProjectStats);
router.get('/:id', protect, getProjectById);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;

