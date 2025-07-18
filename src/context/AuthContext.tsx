import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
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

// Mock user for demonstration
const mockUser: User = {
  id: 'user123',
  email: 'climber@example.com',
  displayName: 'Boulder Explorer',
  preferences: {
    language: 'en',
    theme: 'light',
    defaultGradeSystem: 'v-scale'
  },
  stats: {
    bouldersSubmitted: 15,
    gradesVoted: 142,
    hardestSend: 'V7',
    favoriteArea: 'Fontainebleau',
    averageRating: 4.3
  },
  createdAt: new Date('2020-01-15')
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth state
    const storedUser = localStorage.getItem('boulder-atlas-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Convert createdAt back to Date object if it exists
        if (user.createdAt) {
          user.createdAt = new Date(user.createdAt);
        }
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('boulder-atlas-user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setTimeout(() => {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }, 1000);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = { ...mockUser, email: credentials.email };
    localStorage.setItem('boulder-atlas-user', JSON.stringify(user));
    
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const register = async (credentials: RegisterCredentials) => {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = { 
      ...mockUser, 
      email: credentials.email,
      displayName: credentials.displayName,
      stats: {
        ...mockUser.stats,
        bouldersSubmitted: 0,
        gradesVoted: 0,
        hardestSend: undefined,
        favoriteArea: undefined,
        averageRating: 0
      }
    };
    localStorage.setItem('boulder-atlas-user', JSON.stringify(user));
    
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('boulder-atlas-user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      localStorage.setItem('boulder-atlas-user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};