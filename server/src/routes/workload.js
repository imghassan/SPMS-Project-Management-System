const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkloadEntry = require('../models/WorkloadEntry');
const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/workload/grid
// @desc    Get workload grid data for a date range
router.get('/grid', protect, async (req, res) => {
    try {
        const { startDate, endDate, department, project } = req.query;

        let userQuery = {};
        if (department && department !== 'All') {
            userQuery.department = new RegExp(`^${department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        }

        const userProjects = await Project.find({
            $or: [
                { admin: req.user._id },
                { lead: req.user._id },
                { members: req.user._id }
            ]
        });

        const sharedMemberIds = new Set();
        // Always include the current user to ensure visibility of own data
        sharedMemberIds.add(req.user._id.toString());

        userProjects.forEach(proj => {
            sharedMemberIds.add(proj.admin.toString());
            if (proj.lead) sharedMemberIds.add(proj.lead.toString());
            (proj.members || []).forEach(m => sharedMemberIds.add(m.toString()));
        });
        const allowedIds = Array.from(sharedMemberIds).map(id => new mongoose.Types.ObjectId(id));

        // If a specific project is selected, only show users who are members of that project
        if (project && project !== 'All') {
            const projectDoc = await Project.findById(project);
            if (projectDoc) {
                const projectMemberIds = [
                    projectDoc.admin.toString(),
                    ...(projectDoc.members || []).map(m => m.toString())
                ];
                if (projectDoc.lead) projectMemberIds.push(projectDoc.lead.toString());
                
                // Intersection with allowed IDs to be safe
                userQuery._id = { $in: projectMemberIds.filter(id => sharedMemberIds.has(id)) };
            } else {
                // If project not found, return empty
                return res.json([]);
            }
        } else {
            // Apply shared project filter globally
            userQuery._id = { $in: allowedIds };
        }

        const users = await User.find(userQuery);
        const start = new Date(startDate || new Date().toISOString().split('T')[0]);
        const end = new Date(endDate || new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const result = await Promise.all(users.map(async (user) => {
            const entryQuery = {
                userId: user._id,
                date: { $gte: start, $lte: end }
            };

            // If a specific project is selected, only count hours from that project
            if (project && project !== 'All') {
                entryQuery.projectId = project;
            } else {
                // IMPORTANT: Only show hours from projects the requesting user is part of (Security/Privacy)
                entryQuery.projectId = { $in: userProjects.map(p => p._id) };
            }

            const entries = await WorkloadEntry.find(entryQuery);

            const dailyHours = [];
            let totalHoursInWeek = 0;
            let totalHoursSpentInWeek = 0;

            // Iterate through every day in range
            const current = new Date(start);
            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const dayEntry = entries.filter(e => e.date.toISOString().split('T')[0] === dateStr);
                const spent = dayEntry.reduce((sum, e) => sum + (e.hoursSpent || 0), 0);
                dailyHours.push({ date: dateStr, hoursSpent: spent });
                totalHoursSpentInWeek += spent;

                current.setDate(current.getDate() + 1);
            }

            const capacityPercentage = Math.round((totalHoursSpentInWeek / (user.weeklyCapacityHours || 40)) * 100);

            let dailyOverHours = 0;
            let hasDailyOverload = false;
            dailyHours.forEach(d => {
                const maxDay = d.hoursSpent || 0;
                if (maxDay > 12) {
                    hasDailyOverload = true;
                    dailyOverHours += (maxDay - 12);
                }
            });

            const isOverloaded = capacityPercentage > 100 || hasDailyOverload;
            const weeklyOverHours = capacityPercentage > 100 ? totalHoursSpentInWeek - (user.weeklyCapacityHours || 40) : 0;
            const overHours = Math.max(weeklyOverHours, dailyOverHours);

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department || 'General',
                avatar: user.avatar,
                capacityPercentage,
                totalHoursSpentInWeek,
                isOverloaded,
                overHours,
                dailyHours
            };
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/workload/alerts
// @desc    Get over-allocated members
router.get('/alerts', protect, async (req, res) => {
    try {
        // Determine accessible users based on shared projects
        const userProjects = await Project.find({
            $or: [
                { admin: req.user._id },
                { lead: req.user._id },
                { members: req.user._id }
            ]
        });

        const sharedMemberIds = new Set();
        sharedMemberIds.add(req.user._id.toString());
        userProjects.forEach(proj => {
            sharedMemberIds.add(proj.admin.toString());
            if (proj.lead) sharedMemberIds.add(proj.lead.toString());
            (proj.members || []).forEach(m => sharedMemberIds.add(m.toString()));
        });
        const allowedIds = Array.from(sharedMemberIds).map(id => new mongoose.Types.ObjectId(id));

        const users = await User.find({ _id: { $in: allowedIds } });
        const today = new Date();
        const day = today.getDay();
        const diffToMonday = (day === 0 ? 6 : day - 1);

        const start = new Date(today);
        start.setDate(today.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const alerts = [];
        for (const user of users) {
            const entries = await WorkloadEntry.find({
                userId: user._id,
                date: { $gte: start, $lte: end }
            });

            let totalHoursInWeek = 0;
            const dailyTotals = {};

            entries.forEach(e => {
                const dateStr = e.date.toISOString().split('T')[0];
                if (!dailyTotals[dateStr]) {
                    dailyTotals[dateStr] = { spent: 0 };
                }
                dailyTotals[dateStr].spent += (e.hoursSpent || 0);
                totalHoursInWeek += (e.hoursSpent || 0);
            });

            let dailyOverHours = 0;
            let hasDailyOverload = false;

            Object.values(dailyTotals).forEach(d => {
                const maxDay = d.spent;
                if (maxDay > 12) {
                    hasDailyOverload = true;
                    dailyOverHours += (maxDay - 12);
                }
            });

            const cap = user.weeklyCapacityHours || 40;
            const isWeeklyOverloaded = totalHoursInWeek > cap;

            if (isWeeklyOverloaded || hasDailyOverload) {
                const weeklyOverHours = isWeeklyOverloaded ? totalHoursInWeek - cap : 0;
                alerts.push({
                    name: user.name,
                    overHours: Math.max(weeklyOverHours, dailyOverHours),
                    avatar: user.avatar
                });
            }
        }
        res.json(alerts);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/workload/department-capacity
// @desc    Get aggregated capacity per department
router.get('/department-capacity', protect, async (req, res) => {
    try {
        // Determine accessible users based on shared projects
        const userProjects = await Project.find({
            $or: [
                { admin: req.user._id },
                { lead: req.user._id },
                { members: req.user._id }
            ]
        });

        const sharedMemberIds = new Set();
        // Always include the current user
        sharedMemberIds.add(req.user._id.toString());

        userProjects.forEach(proj => {
            sharedMemberIds.add(proj.admin.toString());
            if (proj.lead) sharedMemberIds.add(proj.lead.toString());
            (proj.members || []).forEach(m => sharedMemberIds.add(m.toString()));
        });
        const allowedIds = Array.from(sharedMemberIds).map(id => new mongoose.Types.ObjectId(id));

        const departments = await User.distinct('department', { _id: { $in: allowedIds } });
        const results = await Promise.all(departments.map(async (dept) => {
            const users = await User.find({ department: dept, _id: { $in: allowedIds } });
            const totalCap = users.reduce((sum, u) => sum + (u.weeklyCapacityHours || 40), 0);

            const start = new Date();
            start.setDate(start.getDate() - start.getDay() + 1);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);

            const userIds = users.map(u => u._id);
            const entries = await WorkloadEntry.find({
                userId: { $in: userIds },
                date: { $gte: start, $lte: end }
            });
            const usedCap = entries.reduce((sum, e) => sum + (e.hoursSpent || 0), 0);
            const percentage = totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 0;

            return {
                department: dept,
                percentage,
                isWarning: percentage >= 85
            };
        }));
        res.json(results);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/workload/weekly-efficiency
// @desc    Get total hours per day across all members
router.get('/weekly-efficiency', protect, async (req, res) => {
    try {
        const start = new Date(req.query.startDate || new Date().toISOString().split('T')[0]);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const results = [];

        // Determine accessible users
        const userProjects = await Project.find({
            $or: [
                { admin: req.user._id },
                { lead: req.user._id },
                { members: req.user._id }
            ]
        });
        const sharedMemberIds = [req.user._id];
        userProjects.forEach(proj => {
            sharedMemberIds.push(proj.admin);
            if (proj.lead) sharedMemberIds.push(proj.lead);
            (proj.members || []).forEach(m => sharedMemberIds.push(m));
        });

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            const entries = await WorkloadEntry.find({
                userId: { $in: sharedMemberIds },
                date: { $gte: new Date(dateStr), $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000) }
            });
            const hours = entries.reduce((sum, e) => sum + (e.hoursSpent || 0), 0);
            results.push({
                day: days[d.getDay()],
                hours
            });
        }
        res.json(results);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});



// @route   POST /api/workload/log-time
// @desc    Log actual hours spent on a task
router.post('/log-time', protect, async (req, res) => {
    try {
        const { userId, date, hoursSpent, projectId, taskId } = req.body;

        const logDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Allow logging up to the end of today

        // 1. Prevent future logging
        if (logDate > today) {
            return res.status(400).json({ success: false, message: 'Cannot log time for future dates' });
        }

        // 2. Validate hoursSpent input
        const hours = Number(hoursSpent);
        if (isNaN(hours) || hours <= 0 || hours > 24) {
            return res.status(400).json({ success: false, message: 'Invalid hours. Must be between 0.1 and 24' });
        }

        // 3. Check 24h daily limit per user
        // Sum all existing hours for this user on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingEntries = await WorkloadEntry.find({
            userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const currentTotal = existingEntries.reduce((sum, e) => sum + (e.hoursSpent || 0), 0);
        if (currentTotal + hours > 24) {
            return res.status(400).json({
                success: false,
                message: `Cannot log ${hours}h. Total for this day would reach ${currentTotal + hours}h (Max 24h).`
            });
        }

        // 4. Update or Create WorkloadEntry
        const query = {
            userId,
            date: startOfDay, // Use standardized start of day for consistency
            ...((taskId && taskId !== 'null') && { taskId })
        };

        const update = {
            $inc: { hoursSpent: hours },
            $setOnInsert: { projectId }
        };

        const workloadEntry = await WorkloadEntry.findOneAndUpdate(query, update, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        });

        // 2. Update Task if taskId exists
        if (taskId && taskId !== 'null') {
            const task = await Task.findById(taskId);
            if (task) {
                // Initialize analytics if it doesn't exist to prevent undefined/NaN errors
                if (!task.analytics) {
                    task.analytics = { timeLogged: 0 };
                }
                task.analytics.timeLogged = (task.analytics.timeLogged || 0) + hours;
                await task.save();
            }
        }

        res.json(workloadEntry);
    } catch (err) {
        console.error('Error logging time:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
});

module.exports = router;
