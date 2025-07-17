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
  createProfile: (profile: ProfileFormData) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
} 