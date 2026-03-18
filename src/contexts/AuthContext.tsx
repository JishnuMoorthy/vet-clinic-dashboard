import React, { createContext, useContext, useState, useCallback } from "react";
import type { User, AuthResponse, UserRole } from "@/types/api";
import { mockLogin } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token")
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Query users table directly
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("is_deleted", false)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        const e: any = new Error("Invalid email or password");
        if (error?.code) e.code = error.code;
        throw e;
      }

      // Verify password with bcrypt
      const passwordValid = await bcrypt.compare(password, data.password_hash);
      if (!passwordValid) throw new Error("Invalid email or password");

      // Map DB user to frontend User type
      const mappedUser: User & { clinic_id: string } = {
        id: data.id,
        email: data.email,
        full_name: data.name,
        role: data.role as UserRole,
        phone: data.phone || undefined,
        is_active: data.is_active ?? true,
        clinic_id: data.clinic_id,
        created_at: data.created_at || "",
        updated_at: data.updated_at || "",
      };

      // Generate a simple session token
      const sessionToken = `sb_${data.id}_${Date.now()}`;

      localStorage.setItem("auth_token", sessionToken);
      localStorage.setItem("auth_user", JSON.stringify(mappedUser));
      setToken(sessionToken);
      setUser(mappedUser);
    } catch (err: any) {
      // If network/Supabase error, fall back to mock login
      if (
        err.message === "Failed to fetch" ||
        err.message === "Load failed" ||
        err.code === "PGRST116" // no rows found - could be empty DB
      ) {
        console.warn("[Auth] Supabase unreachable or empty, using mock login");
        const data = mockLogin(email, password);
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
      } else {
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, isLoading, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      logout: () => {},
      hasRole: () => false,
    };
  }
  return context;
}
