// import React, { useEffect } from 'react';
// import { useTasks } from '../hooks/useTasks';
// import TaskTable from '../components/tasks/TaskTable';

// const DueSoon = () => {
//     const { fetchTasks } = useTasks();

//     useEffect(() => {
//         fetchTasks();
//     }, [fetchTasks]);

//     return (
//         <div className="max-w-7xl mx-auto pb-12">
//             <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-text-primary mb-2">Due Soon</h1>
//                 <p className="text-text-muted">Tasks that require your immediate attention.</p>
//             </div>

//             <div className="lg:col-span-2 flex flex-col gap-6">
//                 <TaskTable />
//             </div>
//         </div>
//     );
// };

// export default DueSoon;
