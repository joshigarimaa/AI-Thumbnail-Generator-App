import { createContext, useContext, useEffect, useState } from "react";
import type { IUser } from "../assest/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

interface AuthContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  login: (user: { email: string; password: string }) => Promise<void>;
  signUp: (user: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loading: boolean; 
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
  fetchUser: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const signUp = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }

      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
    }
  };

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }

      toast.success(data.message);
    } catch (error) {
      toast.error(
        "Failed to login. Please check your credentials and try again.",
      );
    }
  };

  const logout = async () => {
    try {
      const { data } = await api.post("/api/auth/logout");

      setUser(null);
      setIsLoggedIn(false);

      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/auth/verify");

      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    signUp,
    login,
    logout,
    fetchUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);
export default useAuth;