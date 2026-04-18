import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Loader2, MessageSquare, Users, X, Trash2, MoreVertical } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/apiClient';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import { useSocket } from '../../context/SocketContext';
import '../../styles/Components/TeamChatInline.css';

const Avatar = ({ sender, size = 8 }) => {
  const url = getAvatarUrl(sender?.avatar);
  const initials = sender?.name?.charAt(0)?.toUpperCase() || '?';
  const cls = `w-${size} h-${size} rounded-full border border-white/10 overflow-hidden shrink-0`;

  return url ? (
    <img src={url} alt={sender?.name || ''} className={cls + ' object-cover'} />
  ) : (
    <div className={`${cls} flex items-center justify-center text-[11px] font-black avatar-fallback`}>
      {initials}
    </div>
  );
};

const MessageBubble = ({ msg, isMe, showName, onDelete }) => {

  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Collect all files from both msg.files (new) and msg.file (legacy)
  const allFiles = [...(msg.files || []), ...(msg.file && msg.file.url ? [msg.file] : [])];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`group flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar sender={msg.sender} size={8} />

      <div className={`relative max-w-[65%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>

        {showName && !isMe && (
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">
            {msg.sender?.name}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
            isMe
              ? 'rounded-tr-none font-semibold message-bubble-me'
              : 'rounded-tl-none font-medium message-bubble-other'
          }`}
        >
          {/* File Attachment Rendering */}
          {allFiles.length > 0 && (
            <div className="mb-1 space-y-2">
              {allFiles
                .filter(file => file && (file.url || file.path)) // Robust check
                .map((file, fIdx) => {
                  const rawUrl = file.url || file.path || '';
                  // Ensure backendUrl doesn't have trailing slash and rawUrl has leading slash
                  const normalizedBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
                  const normalizedFileUrl = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
                  const fileUrl = normalizedBackendUrl + normalizedFileUrl;

                  const isImage = file.fileType?.startsWith('image/');
                  return (
                    <div key={fIdx} className="overflow-hidden rounded-xl bg-black/20">
                      {isImage ? (
                        <img
                          src={fileUrl}
                          alt={file.originalname || file.name || 'Attachment'}
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
                              {file.size ? (file.size / 1024).toFixed(1) : '0'} KB
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Text Content */}
          {msg.content && (
            <div className="px-3 py-1.5 text-[13px] leading-relaxed font-medium">
              {msg.content}
            </div>
          )}
        </div>

        {isMe && (
          <button
            onClick={() => onDelete(msg._id)}
            className={`absolute ${isMe ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20`}
            title="Delete message"
          >
            <Trash2 size={14} />
          </button>
        )}

        <span className={`text-[9px] text-[#94A3B8]/40 ${isMe ? 'mr-1' : 'ml-1'}`}>{time}</span>
      </div>

    </motion.div>
  );
};

const TeamChatInline = ({ teamId = 'general', teamMembers = [] }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState('');
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);


  /*  Socket + history  */
  useEffect(() => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId || !socket) return;

    socket.emit('join-room', teamId);

    const onMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const onTyping = (data) => {
      if (data.userId !== currentUserId && data.teamId === teamId) {
        setTypingName(data.name || 'Someone');
        setIsTyping(true);
        if (window.typingTimeoutInline) clearTimeout(window.typingTimeoutInline);
        window.typingTimeoutInline = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const onDelete = (messageId) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const onClear = (tId) => {
      if (tId === teamId) setMessages([]);
    };

    socket.on('message-received', onMessage);
    socket.on('user-typing', onTyping);
    socket.on('message-deleted', onDelete);
    socket.on('chat-cleared', onClear);


    const fetchHistory = async () => {
      setLoading(true);
      try {
        console.log(`Fetching chat history for room: ${teamId || 'general'}`);
        const res = await api.get(`/chat/history?teamId=${teamId || 'general'}`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error('Chat history error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Safety fallback: ensure loading clears even if API hangs
    const loadTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    fetchHistory();

    return () => {
      clearTimeout(loadTimeout);
      socket.off('message-received', onMessage);
      socket.off('user-typing', onTyping);
      socket.off('message-deleted', onDelete);
      socket.off('chat-cleared', onClear);
    };
  }, [teamId, user?.id, user?._id, socket]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /*  Auto-scroll  */

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /*  Auto-grow textarea  */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = (e, fileData = null) => {
    e?.preventDefault();
    const content = input.trim();
    const fileToUpload = fileData || pendingFile;

    if (!content && !fileToUpload) return;
    const currentUserId = user?.id || user?._id;
    if (!currentUserId || !socket) return;

    socket.emit('send-message', {
      teamId,
      senderId: currentUserId,
      content: content || '',
      files: fileToUpload ? [fileToUpload] : []
    });

    setInput('');
    setPendingFile(null);
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
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleFileUpload = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await api.post('/chat/upload', formData);
      if (res.data.success) {
        const fileData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        setPendingFile(fileData);
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const currentUserId = user?.id || user?._id;
    socket?.emit('typing', { teamId, userId: currentUserId, name: user.name });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  /*  Online members  */
  const onlineCount = Math.min(teamMembers.length, Math.max(1, Math.floor(teamMembers.length * 0.6)));

  return (
    <div className="flex mt-6 rounded-2xl overflow-hidden border team-chat-container">
      {/*  Left: Member List sidebar  */}
      <div className="hidden lg:flex flex-col border-r chat-sidebar">
        {/* Sidebar header */}
        <div className="p-4 border-b chat-bordered-element">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-[#00D1FF]" />
            <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[12px] text-white font-bold">{onlineCount} active</span>
          </div>
        </div>

        {/* Member avatars */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1 custom-scrollbar-chat">
          {teamMembers.map((m, i) => (
            <div
              key={m._id || i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="relative">
                <Avatar sender={m} size={7} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-[12px] font-bold truncate">{m.name}</div>
                <div className="text-[#94A3B8] text-[10px] truncate">{m.role || 'Member'}</div>
              </div>
            </div>
          ))}
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-[#94A3B8]/40 text-xs">No members</div>
          )}
        </div>
      </div>

      {/*  Right: Chat area  */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 chat-bordered-element">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border chat-header-icon">
              <MessageSquare size={18} className="text-[#00D1FF]" />
            </div>
            <div>
              <h3 className="text-white font-black text-[15px] tracking-tight">Team Hub</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Live · {messages.length} messages</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stacked avatars */}
            <div className="flex -space-x-2 hidden sm:flex">
              {teamMembers.slice(0, 5).map((m, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0A101C] overflow-hidden shrink-0">
                  {getAvatarUrl(m.avatar) ? (
                    <img src={getAvatarUrl(m.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-black avatar-fallback">
                      {m.name?.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {teamMembers.length > 5 && (
                <div className="w-7 h-7 rounded-full border-2 border-[#0A101C] bg-white/10 flex items-center justify-center text-[9px] font-black text-white">
                  +{teamMembers.length - 5}
                </div>
              )}
            </div>

            {/* Options Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#94A3B8] hover:text-white"
              >
                <MoreVertical size={20} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-[#131B2A] border border-white/10 rounded-xl shadow-2xl z-[100]"
                  >
                    <button
                      onClick={handleClearChat}
                      className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Trash2 size={16} />
                      Clear Chat
                    </button>
                    {/* Add more menu items here if needed */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>


        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar-chat">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
              <Loader2 className="animate-spin text-[#00D1FF]" size={28} />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">Syncing Messages</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <Smile size={30} />
              </div>
              <p className="text-sm text-white font-medium">No messages yet.</p>
              <p className="text-xs text-[#94A3B8] mt-1">Be the first to break the ice! 👋</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const currentUserId = user?.id || user?._id;
              const isMe = msg.sender?._id === currentUserId || msg.sender?.id === currentUserId;
              const prevMsg = messages[idx - 1];
              const showName = !isMe && prevMsg?.sender?._id !== msg.sender?._id;
              return (
                <MessageBubble
                  key={msg._id || idx}
                  msg={msg}
                  isMe={isMe}
                  showName={showName}
                  onDelete={handleDeleteMessage}
                />
              );
            })

          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[11px] italic text-[#00D1FF] font-bold"
              >
                <span className="flex gap-1">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </span>
                {typingName} is typing...
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t shrink-0 chat-bordered-element">
          <form onSubmit={sendMessage} className="flex items-end gap-3">
            {/* My avatar */}
            <div className="shrink-0">
              <Avatar sender={user} size={8} />
            </div>

            <div className="flex-1 relative">
              {/* Attachment Preview Overlay */}
              <AnimatePresence mode="wait">
                {pendingFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-4 px-3 py-2 rounded-xl border border-white/10 bg-[#131B2A]/90 backdrop-blur-md flex items-center justify-between ring-1 ring-[#00D1FF]/30 shadow-2xl z-[50]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center shrink-0">
                        <Paperclip size={14} className="text-[#00D1FF]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{pendingFile.name || "Attachment"}</div>
                        <div className="text-[9px] text-[#94A3B8]">
                          {pendingFile.size ? (pendingFile.size / 1024).toFixed(1) : '0'} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingFile(null)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group/close"
                    >
                      <X size={14} className="text-[#94A3B8] group-hover/close:text-white" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative rounded-2xl overflow-hidden transition-all chat-input-container">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder={uploading ? "Uploading file..." : "Say something to the team..."}
                  disabled={uploading}
                  rows={1}
                  className="w-full bg-transparent px-4 py-3 pr-12 text-[13px] text-white placeholder:text-white/25 focus:outline-none resize-none leading-relaxed font-medium chat-textarea"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading}
                  className={`absolute right-3 bottom-3 z-10 p-2 transition-all rounded-lg ${uploading
                    ? 'text-[#00D1FF] animate-pulse'
                    : 'text-[#94A3B8]/60 hover:text-white hover:bg-white/5'
                    }`}
                  title="Attach file"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Paperclip size={16} />
                  )}
                </button>
              </div>
            </div>


            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              type="submit"
              disabled={!input.trim() && !pendingFile}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all chat-send-btn ${
                (input.trim() || pendingFile) ? 'active' : ''
              }`}
            >
              <Send size={16} fill={(input.trim() || pendingFile) ? 'currentColor' : 'none'} />
            </motion.button>
          </form>
          <p className="text-[10px] text-[#94A3B8]/30 mt-2 ml-11 font-medium">
            Press <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[9px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamChatInline;
