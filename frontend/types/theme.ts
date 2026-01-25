/**
 * Theme type definitions
 *
 * Types for dark/light mode theme management
 */

/**
 * Available theme modes
 */
export type Theme = "light" | "dark";

/**
 * Theme context type for React Context
 */
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
