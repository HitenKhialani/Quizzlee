import { QuizResult, getQuizResults } from './quiz-utils';
import { subjects } from '../data/subjects';

export interface SubjectProgress {
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  totalQuizzesTaken: number;
  subjectQuizCompleted: boolean;
  subjectQuizScore?: number;
}

export interface UserProgressData {
  [subjectId: string]: SubjectProgress;
}

/**
 * Calculate user progress for all subjects based on completed quiz results
 */
export const calculateUserProgress = (): UserProgressData => {
  const quizResults = getQuizResults();
  const progressData: UserProgressData = {};

  // Initialize progress for all subjects
  subjects.forEach(subject => {
    progressData[subject.id] = {
      lessonsCompleted: 0,
      totalLessons: subject.lessons.length,
      averageScore: 0,
      totalQuizzesTaken: 0,
      subjectQuizCompleted: false,
    };
  });

  // Process quiz results to calculate progress
  quizResults.forEach(result => {
    const subjectId = result.subjectId;
    
    // Skip if subject doesn't exist in our data
    if (!progressData[subjectId]) return;

    const subjectProgress = progressData[subjectId];
    
    if (result.quizType === 'lesson') {
      // Track lesson completion (only count if passed)
      if (result.passed) {
        // Count unique completed lessons by tracking lesson titles
        const completedLessons = new Set(
          quizResults
            .filter(r => r.subjectId === subjectId && r.quizType === 'lesson' && r.passed)
            .map(r => r.lessonTitle)
        );
        
        subjectProgress.lessonsCompleted = completedLessons.size;
      }
    } else if (result.quizType === 'subject') {
      // Track subject quiz completion
      if (result.passed) {
        subjectProgress.subjectQuizCompleted = true;
        subjectProgress.subjectQuizScore = result.score;
      }
    }
    
    // Count all quiz attempts for this subject
    subjectProgress.totalQuizzesTaken++;
  });

  // Calculate average scores for each subject
  Object.keys(progressData).forEach(subjectId => {
    const subjectQuizzes = quizResults.filter(result => 
      result.subjectId === subjectId && result.passed
    );
    
    if (subjectQuizzes.length > 0) {
      const totalScore = subjectQuizzes.reduce((sum, result) => sum + result.score, 0);
      progressData[subjectId].averageScore = Math.round(totalScore / subjectQuizzes.length);
    }
  });

  return progressData;
};

/**
 * Get progress data for a specific subject
 */
export const getSubjectProgress = (subjectId: string): SubjectProgress | null => {
  const allProgress = calculateUserProgress();
  return allProgress[subjectId] || null;
};

/**
 * Get lesson completion status for a specific subject
 */
export const getLessonProgress = (subjectId: string): Record<string, { isCompleted: boolean; score?: number }> => {
  const quizResults = getQuizResults();
  const lessonProgress: Record<string, { isCompleted: boolean; score?: number }> = {};
  
  // Get the subject to know its lessons
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return {};
  
  // Initialize all lessons as not completed
  subject.lessons.forEach(lesson => {
    lessonProgress[lesson.id] = { isCompleted: false };
  });
  
  // Find lesson quiz results for this subject
  const lessonQuizzes = quizResults.filter(result => 
    result.subjectId === subjectId && result.quizType === 'lesson'
  );
  
  // Group by lesson title to get the best score for each lesson
  const lessonScores: Record<string, number> = {};
  lessonQuizzes.forEach(result => {
    const lessonTitle = result.lessonTitle;
    if (!lessonScores[lessonTitle] || result.score > lessonScores[lessonTitle]) {
      lessonScores[lessonTitle] = result.score;
    }
  });
  
  // Update progress based on completed lessons
  Object.entries(lessonScores).forEach(([lessonTitle, score]) => {
    // Find the lesson ID by matching the title
    const lesson = subject.lessons.find(l => 
      l.title === lessonTitle || l.id === lessonTitle
    );
    
    if (lesson && score >= 60) { // Consider passed if score >= 60%
      lessonProgress[lesson.id] = {
        isCompleted: true,
        score: score
      };
    }
  });
  
  return lessonProgress;
};

/**
 * Check if user has any progress data (useful for showing/hiding progress)
 */
export const hasUserProgress = (): boolean => {
  const quizResults = getQuizResults();
  return quizResults.length > 0;
}; 