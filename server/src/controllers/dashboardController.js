const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const WorkloadEntry = require('../models/WorkloadEntry');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch all projects where the user is an admin or member
        const userProjects = await Project.find({
            $and: [
                { $or: [{ admin: userId }, { members: userId }] },
                { name: { $nin: ['Product Launch 2024', 'Apollo Redesign'] } }
            ]
        });

        const projectIds = userProjects.map(p => p._id);
        const activeProjectsCount = userProjects.filter(p => p.status === 'IN PROGRESS').length;
        const doneProjectsCount = userProjects.filter(p => p.status === 'COMPLETED').length;

        // 2. Fetch all tasks for these projects
        const allTasks = await Task.find({ project: { $in: projectIds } })
            .populate('project', 'name')
            .populate('assignee', 'name avatar');

        // 3. Calculate statistics
        const doneTasksCount = allTasks.filter(task => task.status === 'Done').length;
        const totalTasksCount = allTasks.length;
        const onHoldCount = userProjects.filter(p => p.status === 'ON HOLD').length;

        // 4. Upcoming Deadlines
        const now = new Date();
        const upcomingDeadlines = allTasks
            .filter(task => task.dueDate && task.dueDate >= now && task.status !== 'Done')
            .sort((a, b) => a.dueDate - b.dueDate)
            .slice(0, 3)
            .map(d => ({
                title: d.title,
                date: d.dueDate ? d.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'NO DATE',
                sub: `Priority: ${d.priority}`,
                dot: d.priority === 'High' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    d.priority === 'Medium' ? 'bg-[#00D1FF] shadow-[0_0_8px_rgba(0,209,255,0.4)]' :
                        'bg-[#94A3B8] shadow-[0_0_8px_rgba(148,163,184,0.4)]',
                taskId: d._id,
                projectId: d.project?._id || d.project
            }));

        // 5. Recent Activity
        const recentActivity = allTasks
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 5)
            .map(a => ({
                name: a.assignee?.name || 'System',
                avatar: a.assignee?.avatar || null,
                action: a.status === 'Done' ? 'Done the task' : 'updated the task',
                target: a.title,
                taskId: a._id,
                projectId: a.project?._id || a.project,
                time: a.updatedAt ? formatTimeAgo(a.updatedAt) : 'RECENTLY',
                iconBg: a.status === 'Done' ? 'bg-emerald-500/20' : 'bg-[#94A3B8]/20'
            }));

        // 6. Chart Data: Project Completion Rates
        const chartData = userProjects.map(proj => {
            const projectTasks = allTasks.filter(t => t.project?._id?.toString() === proj._id.toString());
            const total = projectTasks.length;
            const completed = projectTasks.filter(t => t.status === 'Done').length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : proj.progress || 0;

            return {
                n: getInitials(proj.name),
                h: `${percentage}%`,
                active: false
            };
        }).slice(0, 6);

        if (chartData.length > 0) {
            let highestIdx = 0;
            let highestVal = -1;
            chartData.forEach((item, idx) => {
                const val = parseInt(item.h) || 0;
                if (val > highestVal) {
                    highestVal = val;
                    highestIdx = idx;
                }
            });
            chartData[highestIdx].active = true;
        }

        // 7. Calculate Health Highlights
        const efficiency = totalTasksCount > 0
            ? Math.round((doneTasksCount / totalTasksCount) * 100)
            : 0;

        const activeProjectsDelta = `+${activeProjectsCount} Total`;
        const doneProjectsDelta = `+${doneProjectsCount} Total`;
        const efficiencyHighlight = `${efficiency}% Efficiency`;

        res.status(200).json({
            success: true,
            data: {
                activeProjects: activeProjectsCount,
                doneProjects: doneProjectsCount,
                doneTasks: doneTasksCount,
                onHold: onHoldCount,
                totalTasks: totalTasksCount,
                activeProjectsDelta,
                doneProjectsDelta,
                efficiency: efficiencyHighlight,
                upcomingDeadlines,
                recentActivity,
                chartData: chartData.length > 0 ? chartData : [
                    { n: 'NO DATA', h: '0%', active: true }
                ]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get detailed report statistics with filter support
// @route   GET /api/dashboard/reports?dateRange=Last 30 Days&project=All Projects&team=All Members
// @access  Private
exports.getReportStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { dateRange, project: projectFilter, team: teamFilter } = req.query;

        // 1. Resolve date window 
        const now = new Date();
        let startDate = null;

        if (dateRange === 'Last 7 Days') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
        } else if (dateRange === 'Last 30 Days' || !dateRange) {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
        } else if (dateRange === 'This Quarter') {
            const q = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), q * 3, 1);
        } else if (dateRange === 'This Year') {
            startDate = new Date(now.getFullYear(), 0, 1);
        }

        // 2. Resolve project set   
        const userProjects = await Project.find({
            $or: [{ admin: userId }, { members: userId }]
        });

        // 3. Available Filters (Projects and Teams)
        const availableProjects = userProjects.map(p => ({
            id: p._id,
            name: p.name
        }));

        // Resolve Project Filter for the actual report data
        let projectIds = userProjects.map(p => p._id);
        if (projectFilter && projectFilter !== 'All Projects') {
            const matchedProject = userProjects.find(p =>
                p.name.toLowerCase() === projectFilter.toLowerCase()
            );
            if (matchedProject) {
                projectIds = [matchedProject._id];
            }
        }

        // Get unique departments from all users in the projects the current user is in
        const allMemberIds = [...new Set(userProjects.flatMap(p => [p.admin, ...p.members]))];
        const projectUsers = await User.find({ _id: { $in: allMemberIds } }).select('department');
        const availableTeams = [...new Set(projectUsers.map(u => u.department || 'General'))];

        // ── 3. Build task query with optional date + assignee filters ──────────
        const taskQuery = { project: { $in: projectIds } };
        if (startDate) {
            // Match tasks created OR updated within the period.
            // This ensures recently completed tasks (even if created months ago) are included.
            taskQuery.$or = [
                { createdAt: { $gte: startDate, $lte: now } },
                { updatedAt: { $gte: startDate, $lte: now } }
            ];
        }

        // Resolve team / department filter to a list of user IDs
        if (teamFilter && teamFilter !== 'All Members') {
            // Match against department name
            const matchedUsers = await User.find({ department: new RegExp(`^${teamFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).select('_id');
            if (matchedUsers.length > 0) {
                taskQuery.assignee = { $in: matchedUsers.map(u => u._id) };
            }
        }

        const allTasks = await Task.find(taskQuery).populate('assignee', 'name department');

        //  4. Task distribution 
        const distribution = {
            'To Do': allTasks.filter(t => t.status === 'To Do' || t.status === 'Blocked').length,
            'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
            'In Review': allTasks.filter(t => t.status === 'In Review' || t.status === 'Under Review').length,
            'Done': allTasks.filter(t => t.status === 'Done').length,
        };

        //  5. Velocity (last 6 months) 
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('en-US', { month: 'short' }));
        }

        // Fetch ALL tasks for these projects without date filter for velocity history
        const allProjectTasks = startDate
            ? await Task.find({ project: { $in: projectIds } })
            : allTasks;

        const velocityActual = months.map((_, idx) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - idx));
            const m = d.getMonth();
            const y = d.getFullYear();
            return allProjectTasks.filter(t => {
                const updatedDate = new Date(t.updatedAt || t.createdAt);
                return (
                    updatedDate.getMonth() === m &&
                    updatedDate.getFullYear() === y &&
                    t.status === 'Done'
                );
            }).length;
        });

        const velocityPlanned = months.map((_, idx) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - idx));
            const m = d.getMonth();
            const y = d.getFullYear();
            return allProjectTasks.filter(t => {
                if (!t.dueDate) return false;
                const dueDate = new Date(t.dueDate);
                return (
                    dueDate.getMonth() === m &&
                    dueDate.getFullYear() === y
                );
            }).length;
        });

        const velocityData = {
            labels: months,
            planned: velocityPlanned,
            actual: velocityActual
        };

        //  6. Time Tracking Metrics (from WorkloadEntry) 
        const workloadQuery = { projectId: { $in: projectIds } };
        if (startDate) {
            workloadQuery.date = { $gte: startDate, $lte: now };
        }
        // If team/department filter is active, also filter workload entries by user
        if (taskQuery.assignee) {
            workloadQuery.userId = taskQuery.assignee;
        }

        const workloadEntries = await WorkloadEntry.find(workloadQuery)
            .populate('userId', 'name');

        // Total time in minutes (WorkloadEntry stores hoursSpent in hours)
        const totalTimeSpent = Math.round(
            workloadEntries.reduce((sum, e) => sum + (e.hoursSpent || 0), 0) * 60
        );

        // Time by Project (in minutes for chart)
        const timeByProjectMap = {};
        workloadEntries.forEach(e => {
            const pId = e.projectId?.toString();
            const pName = userProjects.find(p => p._id.toString() === pId)?.name || 'Unknown';
            timeByProjectMap[pName] = (timeByProjectMap[pName] || 0) + (e.hoursSpent || 0) * 60;
        });
        const timeByProject = Object.entries(timeByProjectMap)
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .filter(p => p.value > 0);

        // Time by Member (in minutes for chart)
        const timeByMemberMap = {};
        workloadEntries.forEach(e => {
            const mName = e.userId?.name || 'Unknown';
            timeByMemberMap[mName] = (timeByMemberMap[mName] || 0) + (e.hoursSpent || 0) * 60;
        });
        const timeByMember = Object.entries(timeByMemberMap)
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .filter(m => m.value > 0);

        //  7. KPI metrics 
        const totalTasks = allTasks.length;
        const completedTasks = distribution.Done;
        const onTrackPercentage = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        // Average completion time in days (createdAt → now for completed tasks)
        const completedOnes = allTasks.filter(t => t.status === 'Done');
        let avgCompletionDays = 0;
        if (completedOnes.length > 0) {
            const totalDays = completedOnes.reduce((sum, t) => {
                const diff = (new Date() - new Date(t.createdAt)) / (1000 * 60 * 60 * 24);
                return sum + diff;
            }, 0);
            avgCompletionDays = parseFloat((totalDays / completedOnes.length).toFixed(1));
        }

        const avgTimePerTask = (completedTasks && totalTimeSpent) ? parseFloat((totalTimeSpent / completedTasks).toFixed(1)) : 0;

        res.status(200).json({
            success: true,
            data: {
                // Filter Options
                availableProjects,
                availableTeams,
                // Metrics for MetricCards
                totalProjects: userProjects.length,
                totalTasks,
                completedTasks,
                onTrackPercentage,
                avgCompletionDays,
                totalTimeSpent,
                avgTimePerTask,
                // Charts
                distribution,
                velocity: velocityData,
                timeByProject,
                timeByMember
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get current user's task completion progress per project
// @route   GET /api/dashboard/user-stats
// @access  Private
exports.getUserProjectCompletionStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. Find all projects where user is admin or member
        const userProjects = await Project.find({
            $or: [{ admin: userId }, { members: userId }]
        }).lean();

        const projectIds = userProjects.map(p => p._id);

        // 2. Fetch all tasks in these projects
        const projectTasks = await Task.find({
            project: { $in: projectIds }
        }).lean();

        // 3. Process completion rate per project
        const stats = userProjects.map(project => {
            const tasksInProject = projectTasks.filter(t => t.project.toString() === project._id.toString());
            const total = tasksInProject.length;

            if (total === 0) {
                return {
                    name: project.name,
                    initials: getInitials(project.name),
                    completionRate: 0,
                    totalTasks: 0
                };
            }

            const completedRecent = tasksInProject.filter(t =>
                t.status === 'Done' &&
                new Date(t.updatedAt || t.createdAt) >= startDate
            ).length;

            const completionRate = Math.round((completedRecent / total) * 100);

            return {
                name: project.name,
                initials: getInitials(project.name),
                completionRate: Math.min(completionRate, 100),
                totalTasks: total
            };
        })
            .filter(s => s.totalTasks > 0)
            .sort((a, b) => b.totalTasks - a.totalTasks)
            .slice(0, 5); // Top 5 projects by task count

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper function to format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + "y ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + "m ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + "d ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + "m ago";
    return Math.floor(seconds) + "s ago";
}

// Helper function to get project initials
function getInitials(name) {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return words
        .map(word => word[0])
        .slice(0, 3)
        .join('')
        .toUpperCase();
}

/**
 * @desc    Global Search (Projects, Tasks, Users)
 * @route   GET /api/dashboard/search?q=...
 * @access  Private
 */
exports.getGlobalSearch = async (req, res) => {
    try {
        const query = req.query.q;
        const userId = req.user.id;

        if (!query || query.length < 2) {
            return res.status(200).json({ success: true, data: { projects: [], tasks: [], users: [] } });
        }

        const regex = new RegExp(query, 'i');

        // Find projects matching name and where user has access
        const projects = await Project.find({
            name: regex,
            $or: [{ admin: userId }, { members: userId }]
        })
            .select('name status _id')
            .limit(5);

        // Find tasks in those projects
        const uProjects = await Project.find({
            $or: [{ admin: userId }, { members: userId }]
        }).select('_id');
        const pIds = uProjects.map(p => p._id);

        const tasks = await Task.find({
            project: { $in: pIds },
            $or: [{ title: regex }, { description: regex }]
        })
            .populate('project', 'name')
            .select('title status project _id priority')
            .limit(5);

        // Find users globally
        const users = await User.find({
            $or: [{ name: regex }, { email: regex }]
        })
            .select('name email avatar _id department')
            .limit(5);

        res.status(200).json({
            success: true,
            data: { projects, tasks, users }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Export report data to CSV based on current filters
 * @route   GET /api/dashboard/export
 * @access  Private
 */
exports.exportReportData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { dateRange, project: projectFilter, team: teamFilter } = req.query;

        // 1. Resolve date window
        const now = new Date();
        let startDate = null;
        if (dateRange === 'Last 7 Days') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
        } else if (dateRange === 'Last 30 Days' || !dateRange) {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
        } else if (dateRange === 'This Quarter') {
            const q = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), q * 3, 1);
        } else if (dateRange === 'This Year') {
            startDate = new Date(now.getFullYear(), 0, 1);
        }

        // 2. Resolve project set
        const userProjects = await Project.find({
            $or: [{ admin: userId }, { members: userId }]
        });
        let projectIds = userProjects.map(p => p._id);
        if (projectFilter && projectFilter !== 'All Projects') {
            const mp = userProjects.find(p => p.name.toLowerCase() === projectFilter.toLowerCase());
            if (mp) projectIds = [mp._id];
        }

        // 3. Build query
        const query = { project: { $in: projectIds } };
        if (startDate) query.createdAt = { $gte: startDate, $lte: now };
        if (teamFilter && teamFilter !== 'All Members') {
            const users = await User.find({ department: teamFilter }).select('_id');
            if (users.length > 0) query.assignee = { $in: users.map(u => u._id) };
        }

        const tasks = await Task.find(query)
            .populate('project', 'name')
            .populate('assignee', 'name department');

        // 4. Manual CSV build (no external deps)
        const headers = ['Task Title,Project,Status,Priority,Assignee,Department,Due Date,Logged Time(m),Created At'];
        const rows = tasks.map(t => {
            return [
                `"${(t.title || '').replace(/"/g, '""')}"`,
                `"${t.project?.name || 'N/A'}"`,
                t.status,
                t.priority,
                `"${t.assignee?.name || 'Unassigned'}"`,
                `"${t.assignee?.department || 'N/A'}"`,
                t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'N/A',
                t.analytics?.timeLogged || 0,
                t.createdAt.toISOString().split('T')[0]
            ].join(',');
        });

        const csvContent = [headers, ...rows].join('\n');

        // 5. Send file headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=project_report_${Date.now()}.csv`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};