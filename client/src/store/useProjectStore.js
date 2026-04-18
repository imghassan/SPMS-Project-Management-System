import { create } from 'zustand';

const useProjectStore = create((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));

export default useProjectStore;
