export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lessonId: string;
  subject: SubjectType;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  subject: SubjectType;
  order: number;
  estimatedTime: number; // in minutes
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  lessons: Lesson[];
  totalQuestions: number;
}

export interface QuizAttempt {
  id: string;
  quizType: 'lesson' | 'subject' | 'full-syllabus';
  subjectId?: string;
  lessonId?: string;
  questions: Question[];
  userAnswers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  passed: boolean;
}

export interface UserProgress {
  subjectProgress: Record<string, {
    lessonsCompleted: number;
    totalLessons: number;
    averageScore: number;
    timeSpent: number;
  }>;
  recentAttempts: QuizAttempt[];
  totalQuizzesCompleted: number;
  overallAverageScore: number;
}

export type SubjectType = 'data-analytics' | 'operating-systems' | 'entrepreneurship' | 'software-engineering';

export type QuizType = 'lesson' | 'subject' | 'full-syllabus';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  subject?: SubjectType; // Optional subject field for full syllabus quiz
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  selectedAnswer: string | null;
  score: number;
  isComplete: boolean;
}

export type QuizDifficulty = 'easy' | 'hard';
export type QuizChapter = 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'ch6';