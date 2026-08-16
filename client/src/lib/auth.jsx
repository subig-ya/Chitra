import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { clearTokens, setTokens } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chitra_user") || "null");
    } catch {
      return null;
    }
  });
  const [initializing, setInitializing] = useState(true);

  const persistUser = useCallback((u) => {
    setUser(u);
    if (u) localStorage.setItem("chitra_user", JSON.stringify(u));
    else localStorage.removeItem("chitra_user");
  }, []);

  const applySession = useCallback(
    (data) => {
      setTokens(data.tokens);
      persistUser(data.user);
    },
    [persistUser]
  );

  const bootstrap = useCallback(async () => {
    if (!localStorage.getItem("chitra_access")) {
      setInitializing(false);
      return;
    }
    try {
      const { data } = await api.get("/users/me");
      persistUser(data.user);
    } catch {
      clearTokens();
      persistUser(null);
    } finally {
      setInitializing(false);
    }
  }, [persistUser]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onLogout = () => persistUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [persistUser]);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      applySession(data);
      return data;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      applySession(data);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("chitra_refresh"),
      });
    } catch {
      /* ignore */
    }
    clearTokens();
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
