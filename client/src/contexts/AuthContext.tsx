import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginCredentials, RegisterData } from "../types";
import { authService } from "../services/authService";
import { socketService } from "../services/socketService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      socketService.connect(accessToken);
    }

    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await authService.login(credentials);
    const { user, tokens } = response;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    setUser(user);
    socketService.connect(tokens.accessToken);
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await authService.register(data);
    const { user, tokens } = response;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    setUser(user);
    socketService.connect(tokens.accessToken);
  };

  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    socketService.disconnect();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
