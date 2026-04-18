import { create } from 'zustand';

const useModalStore = create((set) => ({
  isCreateProjectModalOpen: false,
  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
}));

export default useModalStore;
