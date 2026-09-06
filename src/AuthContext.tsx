"use client";

import { createContext, useContext, ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const userStatus = useQuery(api.admin.getCurrentUserStatus);

  const user: User | null =
    isAuthenticated && userStatus?.authenticated
      ? {
          id: userStatus.userId || "unknown",
          email: userStatus.email || "unknown@example.com",
        }
      : null;

  const isApproved = userStatus?.approved === true;
  const isAdmin = userStatus?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
        isAuthenticated,
        isApproved,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
