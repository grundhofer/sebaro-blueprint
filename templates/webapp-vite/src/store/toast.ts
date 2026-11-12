// toast.ts: the one toast of the app: the sentence of a result that can be taken back, and how to take it back.
import { create } from "zustand";

export type ToastMessage = { text: string; undo?: () => void };

type Toast = {
  message: ToastMessage | null;
  show(text: string, undo?: () => void): void;
  hide(): void;
};

export const useToast = create<Toast>()((set) => ({
  message: null,
  // a new object for each call: the same sentence shown again starts its time anew
  show: (text, undo) => set({ message: { text, undo } }),
  hide: () => set({ message: null }),
}));
