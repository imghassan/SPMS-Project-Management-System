import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Paperclip, Send, UserCircle2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../../store/useAuthStore';
import UserAvatar from '../ui/UserAvatar';

const CommentFeed = ({ comments = [], onAddComment, newComment, setNewComment, onAttach, isUploading }) => {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onAttach) {
      onAttach(file);
    }
  };

  const triggerAttach = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-8 pt-10 border-t border-white/5 pb-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <MessageSquare size={16} />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase">Discussion</h3>
        </div>
        <div className="text-[10px] font-black text-white/40 tracking-widest uppercase">
          {comments.length} Messages
        </div>
      </div>

      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-6 td-scrollbar">
        <AnimatePresence mode="popLayout">
          {comments.map((comment, index) => (
            <motion.div
              key={comment._id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex gap-5 group"
            >
              <UserAvatar
                user={{ name: comment.author, avatar: comment.avatar }}
                size="md"
                className="rounded-2xl shrink-0 group-hover:border-teal-400/40 shadow-xl"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white">{comment.author}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt)) + ' ago' : 'Recently'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/[0.03] border border-white/5 rounded-[24px] rounded-tl-none px-6 py-4 text-sm text-white/70 leading-relaxed shadow-2xl group-hover:bg-white/[0.05] transition-all">
                    {comment.text}
                  </div>
                  {/* Subtle thread tail */}
                  <div className="absolute top-0 -left-2 w-2 h-2 bg-white/[0.03] border-l border-t border-white/5 group-hover:bg-white/[0.05] transition-all rotate-45" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-white/20 italic tracking-tight">No activity logs recorded yet.</p>
          </div>
        )}
      </div>

      {/* Input Area Overlay */}
      <motion.div
        initial={false}
        className="flex flex-col gap-4 bg-[#0b121e] p-2 rounded-[32px] border border-white/5 focus-within:border-teal-400/30 transition-all shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <UserAvatar
            user={user}
            size="sm"
            className="rounded-2xl ml-2 mt-2 shrink-0 border-teal-400/10"
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Contribute to the thread..."
            className="flex-1 bg-transparent px-2 py-4 text-sm text-white focus:outline-none min-h-[100px] resize-none placeholder:text-white/20 font-medium"
          />
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] bg-white/[0.01] rounded-b-[24px]">
          <button
            onClick={triggerAttach}
            disabled={isUploading}
            className="flex items-center gap-2 p-2 px-4 text-white/40 hover:text-teal-400 transition-all rounded-xl hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
            {isUploading ? 'Uploading...' : 'Attach Ref'}
          </button>
          <motion.button
            whileHover={newComment.trim() ? { scale: 1.05, x: 2 } : {}}
            whileTap={newComment.trim() ? { scale: 0.95 } : {}}
            onClick={onAddComment}
            disabled={!newComment.trim()}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-white bg-[#00d1ff] text-[10px] font-black uppercase tracking-widest transition-all group shadow-[0_8px_24px_rgba(0,209,255,0.1)] ${newComment.trim()
              ? 'hover:bg-teal-300 shadow-[0_8px_24px_rgba(0,209,255,0.25)]'
              : 'cursor-not-allowed shadow-none'
              }`}
          >
            Send Message
            <Send size={14} className={`${newComment.trim() ? 'group-hover:translate-x-1' : ''} transition-transform`} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CommentFeed;
