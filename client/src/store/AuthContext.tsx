import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      console.log('Checking authentication...');
      const user = await authService.getCurrentUser();
      console.log('Auth check result:', user);
      if (user) {
        console.log('Setting user in context:', user);
        setUser(user);
      } else {
        console.log('No user found, setting to null');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Check for auth_success cookie
    const checkAuthCookie = () => {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_success='));
      if (authCookie) {
        console.log('Auth success cookie found, checking user data');
        checkAuth();
        // Remove the cookie
        document.cookie = 'auth_success=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    };

    // Check immediately and then every second for 5 seconds
    checkAuthCookie();
    const interval = setInterval(checkAuthCookie, 1000);
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 