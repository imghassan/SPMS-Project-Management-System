import React, { useState, useEffect } from 'react';
import TaskRow from './TaskRow';
import { useTasks } from '../../hooks/useTasks';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TaskTable = ({ projectId, searchTerm, onTaskClick }) => {
  const { tasks, loading, fetchTasks } = useTasks();
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  useEffect(() => {
    if (projectId) {
      fetchTasks({ project: projectId });
    }
    setCurrentPage(1);
  }, [projectId, fetchTasks, tasks.length]);

  const filteredTasks = tasks.filter(t => {
    const matchesProject = !projectId || t.project === projectId || t.project?._id === projectId || t.project?.name === projectId;
    const matchesSearch  = !searchTerm || (t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesProject && matchesSearch;
  });

  if (loading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00D1FF]/30 border-t-[#00D1FF] rounded-full animate-spin" />
          <span className="text-[#94A3B8] text-[13px] font-medium">Loading tasks…</span>
        </div>
      </div>
    );
  }

  if (!filteredTasks?.length) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.15)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
        </div>
        <p className="text-[#94A3B8] text-[14px] font-medium">No tasks found</p>
        <p className="text-[#6B7280] text-[12px]">Try adjusting your filters or create a new task.</p>
      </div>
    );
  }

  // Pagination
  const indexOfLastTask  = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks     = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages       = Math.ceil(filteredTasks.length / tasksPerPage);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'transparent' }}>
            <th className="py-3.5 px-6 w-12 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]"></th>
            <th className="py-3.5 px-2  text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]">Task Name</th>
            <th className="py-3.5 px-4 w-40 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]">Project</th>
            <th className="py-3.5 px-4 w-48 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]">Assignee</th>
            <th className="py-3.5 px-4 w-32 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]">Due Date</th>
            <th className="py-3.5 px-4 w-32 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]">Priority</th>
            <th className="py-3.5 px-4 w-40 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.12em]">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentTasks.map((task, index) => (
            <TaskRow key={task._id} task={task} index={index} onClick={onTaskClick} />
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="text-[12px] text-[#6B7280]">
          Showing{' '}
          <span className="font-bold text-[#94A3B8]">{indexOfFirstTask + 1}–{Math.min(indexOfLastTask, filteredTasks.length)}</span>
          {' '}of{' '}
          <span className="font-bold text-[#94A3B8]">{filteredTasks.length}</span> tasks
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <ChevronLeft size={15} className="text-[#94A3B8]" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-bold transition-all"
              style={
                currentPage === i + 1
                  ? { background: '#00D1FF', color: '#040911' }
                  : { background: 'rgba(255,255,255,0.03)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <ChevronRight size={15} className="text-[#94A3B8]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTable;
