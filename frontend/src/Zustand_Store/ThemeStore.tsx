"use client";
import {create} from 'zustand';

interface ThemeStore {
    isDarkMode: boolean;
    primaryAccentColor: string;
    secondaryAccentColor: string;
    setDarkMode: (mode: boolean) => void;
    toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
    isDarkMode: true, // Always start with a constant value!
    primaryAccentColor: "#197FE6",
    secondaryAccentColor: "#25D366",
    setDarkMode: (mode) => set({ isDarkMode: mode }),
    toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.isDarkMode;
        if (typeof window !== "undefined") {
            localStorage.setItem("isDarkMode", JSON.stringify(newDarkMode));
        }
        return { isDarkMode: newDarkMode };
    }),
}));