"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { createLogger, AppError } from "./observability";

interface User {
  id: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Create logger once - will update user context as needed
  const logger = useMemo(() => createLogger("AuthProvider"), []);

  // Update logger's user context when user changes
  useEffect(() => {
    logger.setUser(user);
  }, [user, logger]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Simple authentication - check if user is stored in localStorage
      // You can replace this with Clerk, Auth0, or Convex Auth later
      const storedUser = localStorage.getItem("judge-it-user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          logger.info("get_session", {
            authenticated: true,
            userId: userData.id,
          });
        } catch (error) {
          logger.error(
            "get_session",
            new AppError(
              "Failed to parse stored user",
              "AUTH_SESSION_ERROR",
              { error: String(error) },
              error instanceof Error ? error : undefined,
              "AuthProvider.getSession",
            ),
          );
        }
      } else {
        // Auto-login with a demo user for development
        const demoUser = {
          id: "demo-user",
          email: "demo@judge-it.app",
        };
        setUser(demoUser);
        localStorage.setItem("judge-it-user", JSON.stringify(demoUser));
        logger.info("get_session", {
          authenticated: true,
          userId: demoUser.id,
          userEmail: demoUser.email,
          demo: true,
        });
      }
      setLoading(false);
    }
  }, [logger]);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
