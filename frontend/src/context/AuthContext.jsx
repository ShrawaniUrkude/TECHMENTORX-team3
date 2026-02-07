import { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const userData = response.data;
      // Ensure user object has role
      const userWithToken = {
        ...userData.user,
        token: userData.token,
      };
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setUser(userWithToken);
      return userWithToken;
    } catch (error) {
      // Demo mode for hackathon - works without backend
      console.log("Using demo mode - Backend unavailable");

      // Determine role from email (check more specific first)
      let role = "donor";
      if (email.includes("volunteer")) {
        role = "volunteer";
      } else if (email.includes("org")) {
        role = "organization";
      } else if (email.includes("admin")) {
        role = "admin";
      }

      const timestamp = Date.now();
      const demoUser = {
        _id: "demo-" + timestamp,
        name: role.charAt(0).toUpperCase() + role.slice(1) + " User",
        email: email,
        role: role,
        city: "Mumbai",
        pincode: "400001",
        // Include role in token: demo-token-{role}-{timestamp}
        token: `demo-token-${role}-${timestamp}`,
      };

      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const userData = response.data;
      // Ensure user object has role
      const userWithToken = {
        ...userData.user,
        token: userData.token,
      };
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setUser(userWithToken);
      return userWithToken;
    } catch (error) {
      // Demo mode for hackathon
      console.log("Using demo mode - Backend unavailable");

      const timestamp = Date.now();
      const role = data.role || "donor";
      const demoUser = {
        _id: "demo-" + timestamp,
        name: data.name,
        email: data.email,
        role: role,
        city: data.city || "Mumbai",
        pincode: data.pincode || "400001",
        // Include role in token: demo-token-{role}-{timestamp}
        token: `demo-token-${role}-${timestamp}`,
      };

      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
