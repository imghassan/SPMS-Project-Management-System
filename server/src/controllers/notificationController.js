const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({ 
      success: true, 
      count: notifications.length, 
      data: notifications.map(n => ({
        ...n._doc,
        id: n._id // Surface consistent ID for frontend
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false }, 
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.clearAll = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user.id });
    res.status(200).json({ success: true, message: `${result.deletedCount} notifications cleared` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
