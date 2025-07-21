import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in the server directory
let db;
try {
  const dbPath = path.join(__dirname, 'quizzle.db');
  console.log(`📊 Initializing database at: ${dbPath}`);
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  throw error;
}

// Create Users table
const createUsersTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatarUrl TEXT,
    role TEXT DEFAULT 'student',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME
  )
`);

// Create QuizResults table
const createQuizResultsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    subjectId TEXT NOT NULL,
    lessonTitle TEXT NOT NULL,
    score INTEGER NOT NULL,
    totalQuestions INTEGER NOT NULL,
    timeSpent INTEGER NOT NULL,
    selectedAnswers TEXT NOT NULL,
    questions TEXT NOT NULL,
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    passed BOOLEAN NOT NULL,
    quizType TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Initialize tables
try {
  createUsersTable.run();
  createQuizResultsTable.run();
  console.log('✅ Database tables created successfully');
} catch (error) {
  console.error('❌ Database table creation failed:', error);
  throw error;
}

// Prepared statements for users
const insertUser = db.prepare(`
  INSERT INTO users (id, name, email, avatarUrl, role, createdAt, lastLogin)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getUserByEmail = db.prepare(`
  SELECT * FROM users WHERE email = ?
`);

const getUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

const updateUserLogin = db.prepare(`
  UPDATE users SET lastLogin = ? WHERE id = ?
`);

const deleteUser = db.prepare(`
  DELETE FROM users WHERE id = ?
`);

// Prepared statements for quiz results
const insertQuizResult = db.prepare(`
  INSERT INTO quiz_results (id, userId, subjectId, lessonTitle, score, totalQuestions, timeSpent, selectedAnswers, questions, completedAt, passed, quizType)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getQuizResultsByUserId = db.prepare(`
  SELECT * FROM quiz_results WHERE userId = ? ORDER BY completedAt DESC
`);

const deleteQuizResultsByUserId = db.prepare(`
  DELETE FROM quiz_results WHERE userId = ?
`);

// User operations
const userOperations = {
  create: (userData) => {
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      insertUser.run(
        userId,
        userData.name,
        userData.email,
        userData.avatarUrl || null,
        userData.role || 'student',
        now,
        now
      );
      
      return getUserById.get(userId);
    } catch (error) {
      throw error;
    }
  },

  findByEmail: (email) => {
    return getUserByEmail.get(email);
  },

  findById: (id) => {
    return getUserById.get(id);
  },

  updateLastLogin: (userId) => {
    const now = new Date().toISOString();
    updateUserLogin.run(now, userId);
    return getUserById.get(userId);
  },

  delete: (userId) => {
    // Delete user and cascade delete quiz results
    deleteUser.run(userId);
  }
};

// Quiz result operations
const quizResultOperations = {
  create: (resultData) => {
    try {
      const resultId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      insertQuizResult.run(
        resultId,
        resultData.userId,
        resultData.subjectId,
        resultData.lessonTitle,
        resultData.score,
        resultData.totalQuestions,
        resultData.timeSpent,
        JSON.stringify(resultData.selectedAnswers),
        JSON.stringify(resultData.questions),
        now,
        resultData.passed ? 1 : 0,
        resultData.quizType
      );
      
      return resultId;
    } catch (error) {
      throw error;
    }
  },

  findByUserId: (userId) => {
    const results = getQuizResultsByUserId.all(userId);
    return results.map(result => ({
      ...result,
      selectedAnswers: JSON.parse(result.selectedAnswers),
      questions: JSON.parse(result.questions),
      passed: Boolean(result.passed)
    }));
  },

  deleteByUserId: (userId) => {
    deleteQuizResultsByUserId.run(userId);
  }
};

// Utility functions
const calculateStreak = (results) => {
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

export {
  db,
  userOperations,
  quizResultOperations,
  calculateStreak
}; 