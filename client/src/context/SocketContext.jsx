import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import { useToast } from '../components/ui/toast.jsx';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const toast = useToast();

  // Connection Management
  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('join', user._id || user.id);
        newSocket.emit('join-room', 'general');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user]);

  // Notification / Message Handling
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      // Only show notification if we are NOT on the chat tab
      // and if the message isn't from us
      const isFromMe = msg.sender?._id === (user?._id || user?.id);
      if (!isChatOpen && !isFromMe) {
        const content = msg.content || (msg.file ? '📎 Shared a file' : '');
        const preview = content.length > 50 ? content.slice(0, 50) + '...' : content;
        toast.info(`New message from ${msg.sender?.name || 'Someone'}: ${preview}`, {
           duration: 5000
        });
      }
    };


    const handleNotification = (data) => {
      addNotification(data);
    };

    socket.on('message-received', handleMessage);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('message-received', handleMessage);
      socket.off('notification', handleNotification);
    };
  }, [socket, isChatOpen, user, toast, addNotification]);

  const emitEvent = useCallback((event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  const value = {
    socket,
    emitEvent,
    isChatOpen,
    setIsChatOpen
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
