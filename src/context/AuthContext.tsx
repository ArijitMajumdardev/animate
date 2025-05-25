"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<User>;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = user !== null;
  const [loading, setLoading] = useState(true);

  const login = (newToken: string, newUser: User) => {
      setUser(newUser);
      console.log("this is the user",newUser)
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

 useEffect(() => {
  const checkTokenValidity = async () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_API+"/valid_token", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          setUser(user);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Token validation failed", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  checkTokenValidity();
}, []);


  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}