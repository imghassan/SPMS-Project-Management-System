const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

/**
 * Background service to scan for and report duplicate tasks within projects.
 * Runs daily at midnight.
 */
const startDuplicateScanner = () => {
  // schedule: second minute hour day month day-of-week
  // '0 0 * * *' = Midnight every day
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Executing daily Duplicate Task Scan...');
    
    try {
      // Find tasks with same title (case-insensitive) and same project
      const duplicates = await Task.aggregate([
        {
          $group: {
            _id: { 
              title: { $trim: { input: { $toLower: '$title' } } }, 
              project: '$project' 
            },
            count: { $sum: 1 },
            taskIds: { $push: '$_id' },
            sampleTitle: { $first: '$title' }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ]);

      if (duplicates.length === 0) {
        console.log('[Cron] Integrity Check: No duplicate tasks found.');
        return;
      }

      console.warn(`[Cron] ALERT: Found ${duplicates.length} sets of duplicate tasks across the system.`);
      
      duplicates.forEach(set => {
        console.warn(`[Cron] Duplicate set in Project ${set._id.project}: "${set.sampleTitle}" (Occurrences: ${set.count})`);
        console.warn(`[Cron] Affected Task IDs: ${set.taskIds.join(', ')}`);
      });

      // Possible Future Action: Auto-merge or delete oldest duplicates.
      // For now, we only log for administrative review.

    } catch (err) {
      console.error('[Cron] Error during duplicate task scan:', err);
    }
  });

  console.log('[Cron] Duplicate Task Scanner has been initialized (Cycle: Midnight Daily).');
};

/**
 * Background service to warn users about approaching or missed deadlines.
 * Runs daily at 9:00 AM.
 */
const startDeadlineAlerter = () => {
  // '0 9 * * *' = 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Executing daily Deadline Warning Scan...');
    
    try {
      const now = new Date();
      const next24h = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      const todayStart = new Date(now.setHours(0,0,0,0));

      // Find tasks that are NOT completed and have a deadline soon or passed
      // AND haven't been warned today.
      const tasksAtRisk = await Task.find({
        status: { $nin: ['Completed', 'Done'] },
        dueDate: { $lte: next24h },
        $or: [
          { lastWarningSentAt: { $exists: false } },
          { lastWarningSentAt: { $lt: todayStart } }
        ]
      }).populate('assignee');

      if (tasksAtRisk.length === 0) {
        console.log('[Cron] Deadline Check: No tasks require warnings today.');
        return;
      }

      let warningsSent = 0;
      let overdueSent = 0;

      for (const task of tasksAtRisk) {
        const isOverdue = task.dueDate < new Date();
        const type = isOverdue ? 'task_overdue' : 'deadline_approaching';
        const title = isOverdue ? 'Task Overdue!' : 'Deadline Approaching';
        const message = isOverdue 
          ? `The deadline for "${task.title}" has passed.` 
          : `"${task.title}" is due within 24 hours.`;

        if (task.assignee && task.assignee._id) {
          await Notification.create({
            recipient: task.assignee._id,
            type: type,
            title: title,
            message: message,
            link: `/tasks/${task._id}`
          });

          task.lastWarningSentAt = new Date();
          await task.save();
          
          if (isOverdue) overdueSent++; else warningsSent++;
        }
      }

      console.log(`[Cron] Completed Deadline Scan: Sent ${warningsSent} warnings and ${overdueSent} overdue alerts.`);

    } catch (err) {
      console.error('[Cron] Error during deadline alerter scan:', err);
    }
  });

  console.log('[Cron] Deadline Alerter Service initialized (Cycle: 9:00 AM Daily).');
};

module.exports = { startDuplicateScanner, startDeadlineAlerter };
