
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Demo user for testing - in production this would come from authentication service
    return {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@dantatatowndevelopers.com',
      role: 'employee',
      department: 'Engineering',
      managerId: '2'
    };
  });

  const login = (email: string, password: string, role: UserRole) => {
    // Demo login logic - in production this would authenticate with backend
    const demoUsers: Record<string, User> = {
      'employee@demo.com': {
        id: '1',
        name: 'John Doe',
        email: 'employee@demo.com',
        role: 'employee',
        department: 'Engineering',
        managerId: '2'
      },
      'manager@demo.com': {
        id: '2',
        name: 'Jane Smith',
        email: 'manager@demo.com',
        role: 'manager',
        department: 'Engineering'
      },
      'admin@demo.com': {
        id: '3',
        name: 'Admin User',
        email: 'admin@demo.com',
        role: 'admin',
        department: 'HR'
      }
    };
    
    setUser(demoUsers[email] || null);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
