import { createContext, useEffect, useState } from "react";

import {
  fetchCurrentUser,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  register as registerRequest,
} from "../api/services";

export const AuthContext = createContext(null);

const tokenStorageKey = "viode-token";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(token));

  const persistToken = (nextToken) => {
    setToken(nextToken);

    if (nextToken) {
      localStorage.setItem(tokenStorageKey, nextToken);
    } else {
      localStorage.removeItem(tokenStorageKey);
    }
  };

  const refreshProfile = async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  };

  const login = async (payload) => {
    const result = await loginRequest(payload);
    persistToken(result.token);
    setUser(result.user);
    return result;
  };

  const register = async (payload) => {
    const result = await registerRequest(payload);
    persistToken(result.token);
    setUser(result.user);
    return result;
  };

  const loginWithGoogle = async (credential) => {
    const result = await loginWithGoogleRequest(credential);
    persistToken(result.token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    persistToken("");
    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }

    refreshProfile()
      .catch(() => {
        logout();
      })
      .finally(() => {
        setBooting(false);
      });
  }, [token]);

  const value = {
    token,
    user,
    booting,
    isAuthenticated: Boolean(token),
    login,
    loginWithGoogle,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
