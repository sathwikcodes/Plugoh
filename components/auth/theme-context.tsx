"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type AuthTheme = "neutral" | "influencer" | "brand";

interface AuthThemeContextType {
  theme: AuthTheme;
  setTheme: (theme: AuthTheme) => void;
}

const AuthThemeContext = createContext<AuthThemeContextType>({
  theme: "neutral",
  setTheme: () => {},
});

export function AuthThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AuthTheme>("neutral");
  return (
    <AuthThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </AuthThemeContext.Provider>
  );
}

export const useAuthTheme = () => useContext(AuthThemeContext);
