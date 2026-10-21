"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types/database";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_USER: AuthUser = {
  id: "usr-demo-owner",
  name: "Parth Racka",
  email: "owner@cuenation.club",
  phone: "+919876543210",
  role: "owner",
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  role: "owner",
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_USER);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cn_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const login = (email: string, role: UserRole = "customer") => {
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: email.split("@")[0] || "Guest Player",
      email,
      role,
    };
    setUser(newUser);
    try {
      localStorage.setItem("cn_auth_user", JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) {
      login("demo@cuenation.club", newRole);
      return;
    }
    const updated: AuthUser = { ...user, role: newRole };
    setUser(updated);
    try {
      localStorage.setItem("cn_auth_user", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("cn_auth_user");
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "customer",
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
