import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User, UserRole } from "@/types/api";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

interface BackendUser {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  specialties?: string[];
}

function mapBackendUser(u: BackendUser): User & { clinic_id: string } {
  return {
    id: u.id,
    email: u.email,
    full_name: u.name,
    role: u.role,
    phone: u.phone || undefined,
    is_active: u.is_active ?? true,
    clinic_id: u.clinic_id,
    created_at: u.created_at || "",
    updated_at: u.created_at || "",
    specialties: u.specialties || [],
  } as User & { clinic_id: string };
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

  // Validate stored token on mount; clear if invalid.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get<BackendUser>("/auth/me")
      .then((u) => {
        if (cancelled) return;
        const mapped = mapBackendUser(u);
        localStorage.setItem("auth_user", JSON.stringify(mapped));
        setUser(mapped);
      })
      .catch(() => {
        // 401 handling already clears storage in api client
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token } = await api.post<{ access_token: string; token_type: string }>(
        "/auth/login",
        { email, password }
      );
      localStorage.setItem("auth_token", access_token);
      setToken(access_token);

      const me = await api.get<BackendUser>("/auth/me");
      const mapped = mapBackendUser(me);
      localStorage.setItem("auth_user", JSON.stringify(mapped));
      setUser(mapped);
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err.message === "Load failed") {
        throw new Error("Unable to connect to the server. Please check your connection.");
      }
      if (err.message === "Unauthorized" || /401/.test(err.message)) {
        throw new Error("Invalid email or password");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.post("/auth/logout", {}).catch(() => {});
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
