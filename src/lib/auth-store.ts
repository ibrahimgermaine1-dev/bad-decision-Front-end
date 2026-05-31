"use client";

import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  coins: number;
  login: () => void;
  logout: () => void;
  deductCoins: (amount: number) => void;
  addCoins: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  coins: 0,
  login: () =>
    set({
      user: {
        id: "demo-user-1",
        email: "demo@baddecision.io",
        name: "Demo User",
      },
      coins: 100,
    }),
  logout: () => set({ user: null, coins: 0 }),
  deductCoins: (amount: number) =>
    set((state) => ({ coins: Math.max(0, state.coins - amount) })),
  addCoins: (amount: number) =>
    set((state) => ({ coins: state.coins + amount })),
}));
