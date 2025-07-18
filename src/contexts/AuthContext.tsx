import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, ProfileFormData, AuthContextType } from '@/types/user';
import { apiClient, User } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionId = localStorage.getItem('quizzle_session_id');
        if (sessionId) {
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear invalid session
        apiClient.clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const createProfile = async (profile: ProfileFormData): Promise<void> => {
    try {
      const user = await apiClient.createProfile(profile);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string): Promise<void> => {
    try {
      const user = await apiClient.login(email);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    // For now, just update local state since we don't have update endpoint
    // In a full implementation, you'd call an API endpoint here
    const updatedUser = { ...user, ...profile };
    setUser(updatedUser);
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const resetProfile = async (): Promise<void> => {
    try {
      await apiClient.resetProfile();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Reset profile error:', error);
      throw error;
    }
  };

  const checkAuth = (): boolean => {
    return isAuthenticated && !!user;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    createProfile,
    loginWithEmail,
    updateProfile,
    logout,
    resetProfile,
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