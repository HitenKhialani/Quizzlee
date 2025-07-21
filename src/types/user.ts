export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: 'student' | 'instructor';
  createdAt: string;
  lastLogin?: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: 'student' | 'instructor';
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  createProfile: (profile: ProfileFormData) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  resetProfile: () => Promise<void>;
  checkAuth: () => boolean;
} 