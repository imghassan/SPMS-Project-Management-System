import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, FileText, ImageIcon, Plus, ExternalLink, Download, Loader2, MoreVertical } from 'lucide-react';

const AttachmentGrid = ({ attachments = [], onUpload, isUploading, canEdit }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6 pt-10 border-t border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <Paperclip size={16} className="text-teal-400" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Resource Center</h3>
        </div>
        <div className="text-[10px] font-black text-white/40 tracking-widest uppercase">
            {attachments.length} DOCUMENTS
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {attachments.map((file, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
            className="group flex items-center gap-4 p-4 rounded-[20px] bg-white/[0.01] border border-white/5 transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Background Icon Accent */}
            <div className="absolute top-0 right-0 pointer-events-none opacity-[0.02] group-hover:opacity-[0.04] transition-opacity -mr-8 -mt-4">
                {file.type === 'pdf' ? <FileText size={80} /> : <ImageIcon size={80} />}
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#0b121e] text-teal-400 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-teal-400/40 group-hover:shadow-[0_0_15px_rgba(0,209,255,0.1) inset] transition-all">
              {file.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
            </div>

            <div className="overflow-hidden flex-1">
               <p className="text-sm font-bold text-white truncate mb-0.5 group-hover:text-teal-400 transition-colors">
                 {file.name}
               </p>
               <div className="flex items-center gap-3">
                   <span className="text-[9px] font-black tracking-widest uppercase text-white/20 bg-white/5 px-1.5 py-0.5 rounded-md">
                     {file.type?.toUpperCase() || 'FILE'}
                   </span>
                   <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                     {file.size}
                   </span>
               </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 shrink-0">
                <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 text-[9px] font-black tracking-widest uppercase text-white/40 hover:bg-teal-400 hover:text-[#040911] transition-all active:scale-95">
                    <Download size={14} />
                    Download
                </button>
                <button className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:bg-white/10 hover:text-white transition-all">
                    <ExternalLink size={14} />
                </button>
            </div>
          </motion.div>
        ))}
        
        {/* Advanced Upload Card - Horizontal Style */}
        {canEdit && (
          <motion.button 
            whileHover={{ scale: 1.005, backgroundColor: 'rgba(0, 209, 255, 0.02)' }}
            whileTap={{ scale: 0.995 }}
            disabled={isUploading}
            onClick={triggerUpload}
            className="flex items-center gap-4 p-4 rounded-[20px] border-2 border-dashed border-white/5 bg-transparent text-white/20 hover:text-teal-400 hover:border-teal-400/30 transition-all group overflow-hidden relative w-full"
          >
            <input 
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-teal-400/10 transition-all shrink-0 ${isUploading ? 'animate-pulse' : ''}`}>
              {isUploading ? <Loader2 size={20} className="animate-spin text-teal-400" /> : <Plus size={20} />}
            </div>
            
            <div className="text-left flex-1">
              <p className="text-[11px] font-black tracking-widest uppercase mb-0.5">
                {isUploading ? 'Transferring Core Files...' : 'Submit Documents'}
              </p>
              <p className="text-[9px] font-bold opacity-30">Max density: 50MB / File</p>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={16} className="text-teal-400" />
            </div>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default AttachmentGrid;
