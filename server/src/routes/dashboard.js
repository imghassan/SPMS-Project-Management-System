const express = require('express');
const router = express.Router();
const { getDashboardStats, getReportStats, getUserProjectCompletionStats, getGlobalSearch, exportReportData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/reports', protect, getReportStats);
router.get('/user-stats', protect, getUserProjectCompletionStats);
router.get('/search', protect, getGlobalSearch);
router.get('/export', protect, exportReportData);

module.exports = router;
