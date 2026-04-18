const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a user-specific room for individual notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their private room`);
    });

    // Join a general chat room (can be team-specific)
    socket.on('join-room', (teamId) => {
      socket.join(teamId || 'general');
      console.log(`Socket ${socket.id} joined room: ${teamId || 'general'}`);
    });

    // Send and broadcast message
    socket.on('send-message', async (data) => {
      try {
        const { teamId, senderId, content, files } = data;

        // Guard: must have senderId and at least content or files
        if (!senderId) { console.error('send-message: missing senderId'); return; }
        if (!content && (!files || files.length === 0)) { console.error('send-message: no content or files'); return; }

        // Save to DB
        const newMessage = new Message({
          sender: senderId,
          content: content || '',
          files: Array.isArray(files) ? files : []
        });

        const savedMessage = await newMessage.save();
        const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name avatar');

        // Broadcast to specific room
        io.to(teamId || 'general').emit('message-received', populatedMessage);

        // --- Create Notifications for others ---
        if (teamId && teamId !== 'general') {
          const team = await Project.findById(teamId);
          if (team) {
            const recipients = team.members
              .map(m => m.toString())
              .filter(id => id !== senderId);

            for (const recipientId of recipients) {
              const notification = new Notification({
                recipient: recipientId,
                sender: senderId,
                type: 'chat_message',
                title: 'New Team Message',
                message: `${populatedMessage.sender.name}: ${content || (files && files.length > 0 ? (files.length === 1 ? 'shared a file' : `shared ${files.length} files`) : '')}`,
                link: `/team?tab=chat`
              });
              await notification.save();
              io.to(recipientId).emit('notification', notification);
            }
          }
        }
      } catch (err) {
        console.error('Socket error - send message:', err.message || err);
      }
    });
    
    // Delete message
    socket.on('delete-message', (data) => {
      try {
        const { messageId, teamId } = data;
        io.to(teamId || 'general').emit('message-deleted', messageId);
      } catch (err) {
        console.error('Socket error - delete message:', err);
      }
    });

    // Clear chat
    socket.on('clear-chat', (data) => {
      const { teamId } = data;
      io.to(teamId || 'general').emit('chat-cleared', teamId);
    });


    socket.on('typing', (data) => {
      socket.to(data.teamId || 'general').emit('user-typing', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
