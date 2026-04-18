import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, User as UserIcon, Minus, Smile, Paperclip, Loader2, Trash2, MoreVertical } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/apiClient';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import { useSocket } from '../../context/SocketContext';


const TeamChat = ({ teamId = 'general' }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);




  //  Establish Socket Connection 
  useEffect(() => {
    if (!user?._id || !socket) return;

    socket.emit('join-room', teamId);

    const onMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    };

    const onTyping = (data) => {
      if (data.userId !== user?._id && data.teamId === teamId) {
        setIsTyping(true);
        // Clear previous timeout if any
        if (window.typingTimeout) clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const onDelete = (messageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const onClear = (tId) => {
      if (tId === teamId) setMessages([]);
    };

    socket.on('message-received', onMessage);
    socket.on('user-typing', onTyping);
    socket.on('message-deleted', onDelete);
    socket.on('chat-cleared', onClear);


    // Fetch History
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/history?teamId=${teamId}`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      socket.off('message-received', onMessage);
      socket.off('user-typing', onTyping);
      socket.off('message-deleted', onDelete);
      socket.off('chat-cleared', onClear);
    };
  }, [teamId, user?._id, socket]);



  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      try {
        await api.delete(`/chat/clear?teamId=${teamId}`);
        socket?.emit('clear-chat', { teamId });
        setMessages([]);
        setIsMenuOpen(false);
      } catch (err) {
        console.error('Clear chat error:', err);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}`);
      socket?.emit('delete-message', { messageId, teamId });
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedContent = inputValue.trim();
    if ((!trimmedContent && pendingFiles.length === 0) || !user?._id) return;

    if (!socket || !socket.connected) {
      console.error('Socket not connected');
      alert('Connection lost. Reconnecting...');
      return;
    }

    const messageData = {
      teamId: teamId || 'general',
      senderId: user._id,
      content: trimmedContent,
      files: JSON.parse(JSON.stringify(pendingFiles)) // Ensure plain array without recursive React proxy objects that break socket io
    };

    console.log('Sending message:', messageData);
    socket.emit('send-message', messageData);
    setInputValue('');
    setPendingFiles([]);

    // Reset textarea height
    if (fileInputRef.current?.form?.querySelector('textarea')) {
      fileInputRef.current.form.querySelector('textarea').style.height = 'inherit';
    }
  };


  const handleTyping = (e) => {
    setInputValue(e.target.value);

    // Auto-expand textarea
    e.target.style.height = 'inherit';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    if (user?._id && socket) {
      socket.emit('typing', { teamId, userId: user._id, name: user.name });
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });

    setUploading(true);

    try {
      const res = await api.post('/chat/upload', formData);
      if (res.data.success) {
        const newData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setPendingFiles((prev) => [...prev, ...newData]);
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };


  // If no user, we shouldn't show the chat or attempt to connect
  if (!user) return null;

  return (
    <>
      {/*  Chat Toggle Button  */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center z-[2000] shadow-2xl transition-all ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        style={{
          background: 'linear-gradient(135deg, #00D1FF 0%, #0099FF 100%)',
          boxShadow: '0 8px 32px rgba(0, 209, 255, 0.4)',
        }}
      >
        <div className="relative">
          <MessageSquare className="text-white" size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0B121E] animate-pulse"></div>
        </div>
      </motion.button>

      {/*  Chat Sidebar  */}
      <AnimatePresence>
        {isOpen && (
          <div key="chat-root-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#040911]/60 backdrop-blur-sm z-[2001]"
            />

            <motion.div
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[400px] z-[2002] flex flex-col"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/20">
                    <MessageSquare size={20} className="text-[#00D1FF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg tracking-tight">Team Chat</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Live Updates</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 py-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-[3000]"
                        >
                          <button
                            onClick={handleClearChat}
                            className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={16} />
                            Clear Chat
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>


              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar-chat">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                    <Loader2 className="animate-spin text-[#00D1FF]" size={32} />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Syncing Messages</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                      <Smile size={32} />
                    </div>
                    <p className="text-sm text-white font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender?._id === user?._id;
                    return (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`group relative flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >

                        {/* Avatar */}
                        <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-white/10">
                          {msg.sender?.avatar && getAvatarUrl(msg.sender.avatar) ? (
                            <img
                              src={getAvatarUrl(msg.sender.avatar)}
                              alt={msg.sender?.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#112222] flex items-center justify-center text-[10px] font-black text-[#00D1FF]">
                              {(msg.sender?.name || 'U').charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase ml-1">
                              {msg.sender?.name}
                            </span>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isMe
                              ? 'bg-[#00D1FF] text-[#040911] font-bold rounded-tr-none'
                              : 'bg-white/5 text-white border border-white/5 rounded-tl-none font-medium'
                              }`}
                          >
                            {/* File Attachment Rendering */}
                            {((msg.files && msg.files.length > 0) || (msg.file && msg.file.url)) && (
                              <div className="mb-2 space-y-2">
                                {[...(msg.files || []), ...(msg.file && msg.file.url ? [msg.file] : [])]
                                  .filter(file => file && (file.url || file.path)) // Robust check
                                  .map((file, fIdx) => {
                                    const rawUrl = file.url || file.path || '';
                                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                                    // Ensure backendUrl doesn't have trailing slash and rawUrl has leading slash
                                    const normalizedBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
                                    const normalizedFileUrl = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
                                    const fileUrl = normalizedBackendUrl + normalizedFileUrl;

                                    const isImage = file.fileType?.startsWith('image/');

                                    return (
                                      <div key={fIdx} className="overflow-hidden rounded-xl bg-black/10 border border-white/5">
                                        {isImage ? (
                                          <img
                                            src={fileUrl}
                                            alt={file.originalname || file.name || "Attachment"}
                                            className="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(fileUrl)}
                                          />
                                        ) : (
                                          <a
                                            href={fileUrl}
                                            download={file.originalname || file.name || "File"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                                          >
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                              <Paperclip size={18} className={isMe ? 'text-[#040911]' : 'text-[#00D1FF]'} />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                              <div className="text-[12px] font-bold truncate">{file.originalname || file.name || "File"}</div>
                                              <div className="text-[10px] opacity-60">
                                                {formatFileSize(file.size)}
                                              </div>
                                            </div>
                                          </a>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}

                            {msg.content}
                          </div>

                          {isMe && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className={`absolute ${isMe ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20`}
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}


                          <span className={`text-[9px] text-[#94A3B8]/40 block ${isMe ? 'text-right' : 'text-left'}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-2 py-1"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-tight italic">Someone is typing...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/5 bg-[#030712]/40">
                <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
                  <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                      {pendingFiles.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl border border-white/10 bg-[#131B2A]/90 backdrop-blur-md flex flex-col gap-2 ring-1 ring-[#00D1FF]/20 shadow-xl z-[2005] max-h-[200px] overflow-y-auto custom-scrollbar-chat"
                        >
                          {pendingFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5 group/file">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center shrink-0">
                                  <Paperclip size={14} className="text-[#00D1FF]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-white truncate">{file.originalname || file.name || "Attachment"}</div>
                                  <div className="text-[9px] text-[#94A3B8]">
                                    {formatFileSize(file.size)}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePendingFile(idx)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group/del"
                              >
                                <X size={14} className="text-[#94A3B8] group-hover/del:text-red-500" />
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      value={inputValue}
                      onChange={handleTyping}
                      placeholder={uploading ? "Uploading..." : "Type your message..."}
                      disabled={uploading}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder:text-[#94A3B8]/40 focus:border-[#00D1FF]/50 outline-none transition-all resize-none min-h-[48px] max-h-[120px]"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      multiple
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={`text-[#94A3B8]/40 hover:text-white transition-colors ${uploading ? 'animate-pulse' : ''}`}
                      >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!inputValue.trim() && pendingFiles.length === 0}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${(inputValue.trim() || pendingFiles.length > 0)
                      ? 'bg-[#00D1FF] text-[#040911] shadow-[0_0_20px_rgba(0,209,255,0.3)]'
                      : 'bg-white/5 text-[#94A3B8]/20'
                      }`}
                  >
                    <Send size={18} fill="currentColor" />
                  </motion.button>
                </form>
              </div>

              {/* Global style for chat scrollbar */}
              <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-chat::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-scrollbar-chat::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar-chat::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 10px;
                }
                .custom-scrollbar-chat::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 209, 255, 0.2);
                }
              ` }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamChat;
