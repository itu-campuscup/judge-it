"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "./SupabaseClient";
import { User } from "@supabase/supabase-js";
import { createLogger, AppError } from "./observability";

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
  
  // Create logger that updates when user changes
  const logger = useMemo(() => createLogger("AuthProvider", user), [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getSession = async () => {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            logger.error(
              "get_session",
              new AppError(
                "Failed to get session",
                "AUTH_SESSION_ERROR",
                { error: error.message },
                error,
                "AuthProvider.getSession"
              )
            );
          } else {
            setUser(session?.user ?? null);
            logger.info("get_session", {
              authenticated: !!session?.user,
              userId: session?.user?.id,
            });
          }
          setLoading(false);
        } catch (error) {
          const appError =
            error instanceof AppError
              ? error
              : error instanceof Error
              ? new AppError(
                  "Unknown session error",
                  "AUTH_SESSION_ERROR",
                  {},
                  error,
                  "AuthProvider.getSession"
                )
              : new AppError(
                  "Unknown session error",
                  "AUTH_SESSION_ERROR",
                  { error: String(error) },
                  undefined,
                  "AuthProvider.getSession"
                );
          logger.error("get_session", appError);
          setLoading(false);
        }
      };

      getSession();

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          const newUser = session?.user ?? null;
          setUser(newUser);
          setLoading(false);

          logger.info("auth_state_change", {
            event,
            authenticated: !!newUser,
            userId: newUser?.id,
            userEmail: newUser?.email,
          });
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
        logger.info("cleanup", { message: "Auth listener unsubscribed" });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - auth listener handles user changes, logger captured for logging

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
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
