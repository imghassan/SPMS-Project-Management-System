import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, FileBarChart2 } from 'lucide-react';
import api from '../../api/apiClient';
import '../../styles/reports.css';

const ReportsHeader = ({ filters }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/dashboard/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProjectReport_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Error:', err);
      // Fallback for alerts if toast is not available in this scope
      alert('Failed to export report metadata. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="reports-header"
    >
      <div className="reports-brand-group">
        <div className="reports-brand-icon">
          <FileBarChart2 size={20} />
        </div>
        <div className="reports-brand-text">
          <h1>Reports Dashboard</h1>
          <div className="reports-status-indicator">
            <div className="reports-status-dot" />
            <p className="reports-status-label">System Analytics • Real-time Data</p>
          </div>
        </div>
      </div>

      <div className="reports-actions-group">

        {/* Tactical Export */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          disabled={isExporting}
          className="reports-export-btn"
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} strokeWidth={3} />
          )}
          <span>{isExporting ? 'Syncing...' : 'Export Report'}</span>
        </motion.button>
      </div>
    </motion.header>
  );
};

export default ReportsHeader;
