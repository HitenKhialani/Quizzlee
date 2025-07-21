import { QuizQuestion, QuizDifficulty, QuizChapter, SubjectType } from '../types/quiz';

// Mapping of lessons to chapters for OS
export const OS_LESSON_TO_CHAPTER: Record<string, string> = {
  'Introduction to Operating Systems': 'ch1',
  'Process Management': 'ch2', 
  'Memory Management': 'ch4',
  'File Systems': 'ch5',
  'System Security': 'ch3' // Using ch3 for system security as it contains scheduling and deadlocks
};

// Mapping of lessons to chapters for Data Analytics
export const DA_LESSON_TO_CHAPTER: Record<string, string> = {
  'Introduction to Data Analytics': 'ch1',
  'Data Collection Methods': 'ch2',
  'Data Cleaning and Preprocessing': 'ch3',
  'Statistical Analysis': 'ch4',
  'Data Visualization': 'ch5'
};

// Mapping of lessons to chapters for Software Engineering
export const SE_LESSON_TO_CHAPTER: Record<string, string> = {
  'Introduction to Software Engineering': 'ch1',
  'Software Development Lifecycle': 'ch2',
  'Requirements Engineering': 'ch3',
  'Software Design and Architecture': 'ch4',
  'Testing and Quality Assurance': 'ch5'
};

// Mapping of lessons to chapters for Entrepreneurship
export const ENT_LESSON_TO_CHAPTER: Record<string, string> = {
  'Introduction to Entrepreneurship': 'ch1',
  'Business Planning': 'ch2',
  'Market Research and Analysis': 'ch3',
  'Finance and Funding': 'ch4'
};

// All OS chapters for subject quiz
export const OS_CHAPTERS: QuizChapter[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];

// All Data Analytics chapters for subject quiz
export const DA_CHAPTERS: QuizChapter[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];

// All Software Engineering chapters for subject quiz
export const SE_CHAPTERS: QuizChapter[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'];

// All Entrepreneurship chapters for subject quiz
export const ENT_CHAPTERS: QuizChapter[] = ['ch1', 'ch2', 'ch3', 'ch4'];

export async function loadOSQuestions(difficulty: QuizDifficulty, chapter: QuizChapter): Promise<QuizQuestion[]> {
  try {
    const response = await fetch(`/api/quiz-questions/OS/${difficulty}/${chapter}`);
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    const questions: QuizQuestion[] = await response.json();
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export async function loadDAQuestions(difficulty: QuizDifficulty, chapter: QuizChapter): Promise<QuizQuestion[]> {
  try {
    const response = await fetch(`/api/quiz-questions/DATA_ANALYTICS/${difficulty}/${chapter}`);
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    const questions: QuizQuestion[] = await response.json();
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export async function loadSEQuestions(difficulty: QuizDifficulty, chapter: QuizChapter): Promise<QuizQuestion[]> {
  try {
    const response = await fetch(`/api/quiz-questions/software en/${difficulty}/${chapter}`);
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    const questions: QuizQuestion[] = await response.json();
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export async function loadENTQuestions(difficulty: QuizDifficulty, chapter: QuizChapter): Promise<QuizQuestion[]> {
  try {
    const response = await fetch(`/api/quiz-questions/ENTREPRENEURSHIP/${difficulty}/${chapter}`);
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    const questions: QuizQuestion[] = await response.json();
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export async function loadOSQuestionsByLesson(lessonTitle: string, difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  const chapter = OS_LESSON_TO_CHAPTER[lessonTitle];
  if (!chapter) {
    console.error(`No chapter mapping found for lesson: ${lessonTitle}`);
    return [];
  }
  
  const allQuestions = await loadOSQuestions(difficulty, chapter as QuizChapter);
  
  // Return 5 random questions from the available questions
  if (allQuestions.length <= 5) {
    return shuffleQuestions(allQuestions);
  } else {
    // Shuffle all questions and take first 5
    const shuffled = shuffleQuestions(allQuestions);
    return shuffled.slice(0, 5);
  }
}

export async function loadDAQuestionsByLesson(lessonTitle: string, difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  const chapter = DA_LESSON_TO_CHAPTER[lessonTitle];
  if (!chapter) {
    console.error(`No chapter mapping found for lesson: ${lessonTitle}`);
    return [];
  }
  
  const allQuestions = await loadDAQuestions(difficulty, chapter as QuizChapter);
  
  // Return 5 random questions from the available questions
  if (allQuestions.length <= 5) {
    return shuffleQuestions(allQuestions);
  } else {
    // Shuffle all questions and take first 5
    const shuffled = shuffleQuestions(allQuestions);
    return shuffled.slice(0, 5);
  }
}

export async function loadSEQuestionsByLesson(lessonTitle: string, difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  const chapter = SE_LESSON_TO_CHAPTER[lessonTitle];
  if (!chapter) {
    console.error(`No chapter mapping found for lesson: ${lessonTitle}`);
    return [];
  }
  
  const allQuestions = await loadSEQuestions(difficulty, chapter as QuizChapter);
  
  // Return 5 random questions from the available questions
  if (allQuestions.length <= 5) {
    return shuffleQuestions(allQuestions);
  } else {
    // Shuffle all questions and take first 5
    const shuffled = shuffleQuestions(allQuestions);
    return shuffled.slice(0, 5);
  }
}

export async function loadENTQuestionsByLesson(lessonTitle: string, difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  const chapter = ENT_LESSON_TO_CHAPTER[lessonTitle];
  if (!chapter) {
    console.error(`No chapter mapping found for lesson: ${lessonTitle}`);
    return [];
  }
  
  const allQuestions = await loadENTQuestions(difficulty, chapter as QuizChapter);
  
  // Return 5 random questions from the available questions
  if (allQuestions.length <= 5) {
    return shuffleQuestions(allQuestions);
  } else {
    // Shuffle all questions and take first 5
    const shuffled = shuffleQuestions(allQuestions);
    return shuffled.slice(0, 5);
  }
}

export async function loadOSSubjectQuiz(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const allQuestions: QuizQuestion[] = [];
    
    // Load questions from all chapters
    for (const chapter of OS_CHAPTERS) {
      const chapterQuestions = await loadOSQuestions(difficulty, chapter);
      allQuestions.push(...chapterQuestions);
    }
    
    // Shuffle all questions to ensure randomness
    const shuffledQuestions = shuffleQuestions(allQuestions);
    
    // Take first 30 questions (or all if less than 30)
    return shuffledQuestions.slice(0, 30);
  } catch (error) {
    console.error('Error loading OS subject quiz questions:', error);
    return [];
  }
}

export async function loadDASubjectQuiz(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const allQuestions: QuizQuestion[] = [];
    
    // Load questions from all chapters
    for (const chapter of DA_CHAPTERS) {
      const chapterQuestions = await loadDAQuestions(difficulty, chapter);
      allQuestions.push(...chapterQuestions);
    }
    
    // Shuffle all questions to ensure randomness
    const shuffledQuestions = shuffleQuestions(allQuestions);
    
    // Take first 30 questions (or all if less than 30)
    return shuffledQuestions.slice(0, 30);
  } catch (error) {
    console.error('Error loading DA subject quiz questions:', error);
    return [];
  }
}

export async function loadSESubjectQuiz(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const allQuestions: QuizQuestion[] = [];
    
    // Load questions from all chapters
    for (const chapter of SE_CHAPTERS) {
      const chapterQuestions = await loadSEQuestions(difficulty, chapter);
      allQuestions.push(...chapterQuestions);
    }
    
    // Shuffle all questions to ensure randomness
    const shuffledQuestions = shuffleQuestions(allQuestions);
    
    // Take first 30 questions (or all if less than 30)
    return shuffledQuestions.slice(0, 30);
  } catch (error) {
    console.error('Error loading SE subject quiz questions:', error);
    return [];
  }
}

export async function loadENTSubjectQuiz(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const allQuestions: QuizQuestion[] = [];
    
    // Load questions from all chapters
    for (const chapter of ENT_CHAPTERS) {
      const chapterQuestions = await loadENTQuestions(difficulty, chapter);
      allQuestions.push(...chapterQuestions);
    }
    
    // Shuffle all questions to ensure randomness
    const shuffledQuestions = shuffleQuestions(allQuestions);
    
    // Take first 30 questions (or all if less than 30)
    return shuffledQuestions.slice(0, 30);
  } catch (error) {
    console.error('Error loading ENT subject quiz questions:', error);
    return [];
  }
}

export async function loadOSSubjectQuizBalanced(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const questionsPerChapter = 6; // 30 total questions / 5 chapters = 6 questions per chapter
    const allQuestions: QuizQuestion[] = [];
    
    // Load and select questions from each chapter
    for (const chapter of OS_CHAPTERS) {
      const chapterQuestions = await loadOSQuestions(difficulty, chapter);
      
      if (chapterQuestions.length > 0) {
        // Shuffle questions for this chapter
        const shuffledChapterQuestions = shuffleQuestions(chapterQuestions);
        
        // Take first 6 questions (or all if less than 6)
        const selectedQuestions = shuffledChapterQuestions.slice(0, questionsPerChapter);
        allQuestions.push(...selectedQuestions);
      }
    }
    
    // Final shuffle to mix questions from different chapters
    return shuffleQuestions(allQuestions);
  } catch (error) {
    console.error('Error loading balanced OS subject quiz questions:', error);
    return [];
  }
}

export async function loadDASubjectQuizBalanced(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const questionsPerChapter = 6; // 30 total questions / 5 chapters = 6 questions per chapter
    const allQuestions: QuizQuestion[] = [];
    
    // Load and select questions from each chapter
    for (const chapter of DA_CHAPTERS) {
      const chapterQuestions = await loadDAQuestions(difficulty, chapter);
      
      if (chapterQuestions.length > 0) {
        // Shuffle questions for this chapter
        const shuffledChapterQuestions = shuffleQuestions(chapterQuestions);
        
        // Take first 6 questions (or all if less than 6)
        const selectedQuestions = shuffledChapterQuestions.slice(0, questionsPerChapter);
        allQuestions.push(...selectedQuestions);
      }
    }
    
    // Final shuffle to mix questions from different chapters
    return shuffleQuestions(allQuestions);
  } catch (error) {
    console.error('Error loading balanced DA subject quiz questions:', error);
    return [];
  }
}

export async function loadSESubjectQuizBalanced(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const questionsPerChapter = 5; // 30 total questions / 6 chapters = 5 questions per chapter
    const allQuestions: QuizQuestion[] = [];
    
    // Load and select questions from each chapter
    for (const chapter of SE_CHAPTERS) {
      const chapterQuestions = await loadSEQuestions(difficulty, chapter);
      
      if (chapterQuestions.length > 0) {
        // Shuffle questions for this chapter
        const shuffledChapterQuestions = shuffleQuestions(chapterQuestions);
        
        // Take first 5 questions (or all if less than 5)
        const selectedQuestions = shuffledChapterQuestions.slice(0, questionsPerChapter);
        allQuestions.push(...selectedQuestions);
      }
    }
    
    // Final shuffle to mix questions from different chapters
    return shuffleQuestions(allQuestions);
  } catch (error) {
    console.error('Error loading balanced SE subject quiz questions:', error);
    return [];
  }
}

export async function loadENTSubjectQuizBalanced(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const questionsPerChapter = 7; // 28 total questions / 4 chapters = 7 questions per chapter (closest to 30)
    const allQuestions: QuizQuestion[] = [];
    
    // Load and select questions from each chapter
    for (const chapter of ENT_CHAPTERS) {
      const chapterQuestions = await loadENTQuestions(difficulty, chapter);
      
      if (chapterQuestions.length > 0) {
        // Shuffle questions for this chapter
        const shuffledChapterQuestions = shuffleQuestions(chapterQuestions);
        
        // Take first 7 questions (or all if less than 7)
        const selectedQuestions = shuffledChapterQuestions.slice(0, questionsPerChapter);
        allQuestions.push(...selectedQuestions);
      }
    }
    
    // Final shuffle to mix questions from different chapters
    return shuffleQuestions(allQuestions);
  } catch (error) {
    console.error('Error loading balanced ENT subject quiz questions:', error);
    return [];
  }
}

export async function loadFullSyllabusQuiz(difficulty: QuizDifficulty = 'hard'): Promise<QuizQuestion[]> {
  try {
    const allQuestions: QuizQuestion[] = [];
    
    // Load 25 questions from each subject
    const questionsPerSubject = 25;
    
    // Load OS questions
    const osQuestions = await loadOSSubjectQuiz(difficulty);
    const selectedOSQuestions = shuffleQuestions(osQuestions).slice(0, questionsPerSubject);
    const osQuestionsWithSubject = selectedOSQuestions.map(q => ({ ...q, subject: 'operating-systems' as SubjectType }));
    allQuestions.push(...osQuestionsWithSubject);
    
    // Load DA questions
    const daQuestions = await loadDASubjectQuiz(difficulty);
    const selectedDAQuestions = shuffleQuestions(daQuestions).slice(0, questionsPerSubject);
    const daQuestionsWithSubject = selectedDAQuestions.map(q => ({ ...q, subject: 'data-analytics' as SubjectType }));
    allQuestions.push(...daQuestionsWithSubject);
    
    // Load SE questions
    const seQuestions = await loadSESubjectQuiz(difficulty);
    const selectedSEQuestions = shuffleQuestions(seQuestions).slice(0, questionsPerSubject);
    const seQuestionsWithSubject = selectedSEQuestions.map(q => ({ ...q, subject: 'software-engineering' as SubjectType }));
    allQuestions.push(...seQuestionsWithSubject);
    
    // Load ENT questions
    const entQuestions = await loadENTSubjectQuiz(difficulty);
    const selectedENTQuestions = shuffleQuestions(entQuestions).slice(0, questionsPerSubject);
    const entQuestionsWithSubject = selectedENTQuestions.map(q => ({ ...q, subject: 'entrepreneurship' as SubjectType }));
    allQuestions.push(...entQuestionsWithSubject);
    
    // Final shuffle to mix questions from different subjects
    return shuffleQuestions(allQuestions);
  } catch (error) {
    console.error('Error loading full syllabus quiz questions:', error);
    return [];
  }
}

export function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Legacy functions for backward compatibility
export const getQuestionsByLesson = (lessonId: string): QuizQuestion[] => {
  // This is kept for backward compatibility but should not be used for OS quizzes
  return [];
};

export const getQuestionsBySubject = (subject: string): QuizQuestion[] => {
  return [];
};

export const getRandomQuestions = (questions: QuizQuestion[], count: number): QuizQuestion[] => {
  return [];
};