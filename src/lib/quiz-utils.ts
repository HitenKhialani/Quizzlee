export interface QuizResult {
  id: string;
  lessonId?: string;
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
  quizType: 'lesson' | 'subject' | 'full-syllabus';
}

export const saveQuizResult = (result: Omit<QuizResult, 'id' | 'completedAt'>) => {
  try {
    // Get existing results
    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    // Create new result with ID and timestamp
    const newResult: QuizResult = {
      ...result,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      completedAt: new Date().toISOString()
    };
    
    // Add to existing results
    const updatedResults = [newResult, ...existingResults];
    
    // Save back to localStorage
    localStorage.setItem('quizResults', JSON.stringify(updatedResults));
    
    return newResult;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return null;
  }
};

export const getQuizResults = (): QuizResult[] => {
  try {
    return JSON.parse(localStorage.getItem('quizResults') || '[]');
  } catch (error) {
    console.error('Error loading quiz results:', error);
    return [];
  }
};

export const clearQuizResults = () => {
  try {
    localStorage.removeItem('quizResults');
  } catch (error) {
    console.error('Error clearing quiz results:', error);
  }
};

export const calculateStreak = (results: QuizResult[]): number => {
  if (results.length === 0) return 0;
  
  const today = new Date();
  const sortedResults = results.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const result of sortedResults) {
    const resultDate = new Date(result.completedAt);
    const dayDiff = Math.floor((currentDate.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff <= 1) {
      streak++;
      currentDate = resultDate;
    } else {
      break;
    }
  }
  
  return streak;
}; 