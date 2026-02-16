import { create } from "zustand";

interface UIState {
  // Modals
  isWalletModalOpen: boolean;
  isCreateCircleModalOpen: boolean;

  // Network
  isOnline: boolean;
  networkError: string | null;

  // Actions
  setWalletModalOpen: (open: boolean) => void;
  setCreateCircleModalOpen: (open: boolean) => void;
  setOnline: (online: boolean) => void;
  setNetworkError: (error: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isWalletModalOpen: false,
  isCreateCircleModalOpen: false,
  isOnline: true,
  networkError: null,

  setWalletModalOpen: (open) => set({ isWalletModalOpen: open }),
  setCreateCircleModalOpen: (open) => set({ isCreateCircleModalOpen: open }),
  setOnline: (online) => set({ isOnline: online }),
  setNetworkError: (error) => set({ networkError: error }),
}));
