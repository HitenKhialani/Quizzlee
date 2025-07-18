import { apiClient, QuizResult } from '@/lib/api';

export interface SubjectProgress {
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  totalQuizzesTaken: number;
  subjectQuizCompleted: boolean;
}

export interface UserProgressData {
  [subjectId: string]: SubjectProgress;
}

// Calculate user progress from API data
export const calculateUserProgress = async (): Promise<UserProgressData> => {
  try {
    const quizResults = await apiClient.getQuizResults();
    return calculateProgressFromResults(quizResults);
  } catch (error) {
    console.error('Failed to fetch quiz results for progress calculation:', error);
    return {};
  }
};

// Helper function to calculate progress from quiz results
export const calculateProgressFromResults = (quizResults: QuizResult[]): UserProgressData => {
  const progressData: UserProgressData = {};

  // Group results by subject
  const subjectGroups = quizResults.reduce((groups, result) => {
    if (!groups[result.subjectId]) {
      groups[result.subjectId] = [];
    }
    groups[result.subjectId].push(result);
    return groups;
  }, {} as Record<string, QuizResult[]>);

  // Calculate progress for each subject
  Object.entries(subjectGroups).forEach(([subjectId, results]) => {
    const lessonResults = results.filter(r => r.quizType === 'lesson');
    const subjectResults = results.filter(r => r.quizType === 'subject');

    // Get unique lessons completed (passed with score >= 60)
    const completedLessons = new Set(
      lessonResults
        .filter(r => r.score >= 60)
        .map(r => r.lessonTitle)
    );

    // Calculate average score for this subject
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

    // Check if subject quiz is completed
    const subjectQuizCompleted = subjectResults.some(r => r.score >= 60);

    progressData[subjectId] = {
      lessonsCompleted: completedLessons.size,
      totalLessons: getSubjectLessonCount(subjectId),
      averageScore,
      totalQuizzesTaken: results.length,
      subjectQuizCompleted,
    };
  });

  return progressData;
};

// Get subject-specific progress
export const getSubjectProgress = async (subjectId: string): Promise<SubjectProgress | null> => {
  const allProgress = await calculateUserProgress();
  return allProgress[subjectId] || null;
};

// Get lesson progress for a specific subject
export const getLessonProgress = async (subjectId: string): Promise<Record<string, { completed: boolean; score: number }>> => {
  try {
    const quizResults = await apiClient.getQuizResults();
    const subjectResults = quizResults.filter(r => r.subjectId === subjectId && r.quizType === 'lesson');
    
    const lessonProgress: Record<string, { completed: boolean; score: number }> = {};
    
    subjectResults.forEach(result => {
      const existing = lessonProgress[result.lessonTitle];
      if (!existing || result.score > existing.score) {
        lessonProgress[result.lessonTitle] = {
          completed: result.score >= 60,
          score: result.score
        };
      }
    });
    
    return lessonProgress;
  } catch (error) {
    console.error('Failed to get lesson progress:', error);
    return {};
  }
};

// Check if user has any progress data
export const hasUserProgress = async (): Promise<boolean> => {
  try {
    const quizResults = await apiClient.getQuizResults();
    return quizResults.length > 0;
  } catch (error) {
    console.error('Failed to check user progress:', error);
    return false;
  }
};

// Save quiz result to API
export const saveQuizResult = async (resultData: {
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
}): Promise<void> => {
  try {
    await apiClient.saveQuizResult(resultData);
  } catch (error) {
    console.error('Failed to save quiz result:', error);
    throw error;
  }
};

// Helper function to get lesson count for a subject
// This should match the actual lesson count from your subjects data
function getSubjectLessonCount(subjectId: string): number {
  const lessonCounts: Record<string, number> = {
    'data-analytics': 5,
    'operating-systems': 5,
    'software-engineering': 6,
    'entrepreneurship': 4,
  };
  
  return lessonCounts[subjectId] || 5; // Default to 5 if not found
}

// Get quiz results for profile/stats display
export const getQuizResults = async (): Promise<QuizResult[]> => {
  try {
    return await apiClient.getQuizResults();
  } catch (error) {
    console.error('Failed to get quiz results:', error);
    return [];
  }
};

// Calculate streak from API data
export const calculateStreak = async (): Promise<number> => {
  try {
    const stats = await apiClient.getProfileStats();
    return stats.streak;
  } catch (error) {
    console.error('Failed to calculate streak:', error);
    return 0;
  }
}; 