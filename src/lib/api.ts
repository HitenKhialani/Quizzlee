const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private sessionId: string | null = null;

  constructor() {
    // Try to get session ID from localStorage on initialization
    this.sessionId = localStorage.getItem('quizzle_session_id');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add session ID to headers if available
    if (this.sessionId) {
      headers['x-session-id'] = this.sessionId;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Session management
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('quizzle_session_id', sessionId);
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('quizzle_session_id');
  }

  // Auth endpoints
  async createProfile(profileData: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  }) {
    const response = await this.request<{
      user: any;
      sessionId: string;
    }>('/auth/create-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });

    this.setSessionId(response.sessionId);
    return response.user;
  }

  async login(email: string) {
    const response = await this.request<{
      user: any;
      sessionId: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    this.setSessionId(response.sessionId);
    return response.user;
  }

  async getCurrentUser() {
    if (!this.sessionId) {
      throw new Error('No session available');
    }

    const response = await this.request<{ user: any }>('/auth/user');
    return response.user;
  }

  async logout() {
    if (!this.sessionId) return;

    await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearSession();
  }

  async resetProfile() {
    await this.request('/auth/reset-profile', {
      method: 'DELETE',
    });

    this.clearSession();
  }

  // Quiz result endpoints
  async saveQuizResult(resultData: {
    subjectId: string;
    lessonTitle: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    selectedAnswers: Record<string, string>;
    questions: Array<{
      question: string;
      options: string[];
      answer: string;
      userAnswer?: string;
      subject?: string;
    }>;
    passed: boolean;
    quizType: 'lesson' | 'subject' | 'full-syllabus';
  }) {
    return await this.request<{ id: string; message: string }>('/quiz-results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  }

  async getQuizResults() {
    return await this.request<Array<{
      id: string;
      userId: string;
      subjectId: string;
      lessonTitle: string;
      score: number;
      totalQuestions: number;
      timeSpent: number;
      selectedAnswers: Record<string, string>;
      questions: Array<{
        question: string;
        options: string[];
        answer: string;
        userAnswer?: string;
        subject?: string;
      }>;
      completedAt: string;
      passed: boolean;
      quizType: string;
    }>>('/quiz-results');
  }

  async getProfileStats() {
    return await this.request<{
      totalQuizzes: number;
      averageScore: number;
      passRate: number;
      totalTimeSpent: number;
      streak: number;
    }>('/profile/stats');
  }

  // Health check
  async healthCheck() {
    return await this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export types for better TypeScript support
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  subjectId: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  selectedAnswers: Record<string, string>;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    userAnswer?: string;
    subject?: string;
  }>;
  completedAt: string;
  passed: boolean;
  quizType: string;
}

export interface ProfileStats {
  totalQuizzes: number;
  averageScore: number;
  passRate: number;
  totalTimeSpent: number;
  streak: number;
} 