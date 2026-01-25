/**
 * Theme Context Provider
 *
 * Manages dark/light mode theme state with localStorage persistence
 *
 * Features:
 * - Dark mode as default (per spec requirements)
 * - localStorage persistence (survives page refreshes)
 * - Manual toggle via .dark class on <html> element
 * - System preference fallback (media query)
 *
 * Usage:
 * ```tsx
 * // In app/layout.tsx
 * <ThemeProvider>
 *   <YourApp />
 * </ThemeProvider>
 *
 * // In any component
 * const { theme, setTheme, toggleTheme } = useTheme();
 * ```
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeContextType } from "@/types/theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Component
 *
 * Wraps app with theme management functionality
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with dark mode as default (per spec FR-050)
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem("theme") as Theme | null;

    if (stored) {
      // User has previously set a preference
      setThemeState(stored);
    } else {
      // No preference - use dark mode as default (per spec)
      setThemeState("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    if (!mounted) return;

    // Add or remove .dark class on <html> element
    // This triggers CSS variables defined in globals.css
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Persist to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  /**
   * Set theme explicitly
   *
   * @param newTheme - "light" or "dark"
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  /**
   * Toggle between light and dark
   */
  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      console.log("Toggling theme from", prev, "to", newTheme);
      return newTheme;
    });
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  // Don't block rendering - just prevent theme flash with CSS
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme hook
 *
 * Access theme state and actions from any component
 *
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
