import { createContext, useState, useEffect } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // Load token when app starts
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);   // Save token
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");          // Remove token
    setToken(null);
  };

  return (
    <LoginContext.Provider value={{ token, login, logout, isLoggedIn: !!token }}>
      {children}
    </LoginContext.Provider>
  );
};
