import { useTasks as useTaskContext } from '../context/TaskContext';

export const useTasks = () => {
    return useTaskContext();
};

export default useTasks;
