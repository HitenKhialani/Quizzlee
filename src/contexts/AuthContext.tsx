import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, ProfileFormData, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('quizzle_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('quizzle_user');
      }
    }
  }, []);

  const createProfile = async (profile: ProfileFormData): Promise<void> => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      ...profile,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Save to localStorage (for MVP)
    localStorage.setItem('quizzle_user', JSON.stringify(newUser));
    
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const updateProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    if (!user) return;

    const updatedUser = { ...user, ...profile };
    localStorage.setItem('quizzle_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = (): void => {
    localStorage.removeItem('quizzle_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = (): boolean => {
    const savedUser = localStorage.getItem('quizzle_user');
    return !!savedUser;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    createProfile,
    updateProfile,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 