import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth.service';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuditor: boolean;
  isAssignee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.access_token);
    
    // Fetch user details
    const userResponse = await fetch('http://localhost:3000/users/profile', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    });
    const userData = await userResponse.json();
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    await authService.register(email, password, firstName, lastName);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = user?.role === 'admin';
  const isAuditor = user?.role === 'auditor';
  const isAssignee = user?.role === 'assignee' || user?.role === 'admin' || user?.role === 'auditor';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout,
      isAdmin,
      isAuditor,
      isAssignee
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}