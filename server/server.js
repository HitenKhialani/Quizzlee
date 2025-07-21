import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { userOperations, quizResultOperations, calculateStreak } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Session storage (in production, use Redis or database sessions)
const sessions = new Map();

// Generate session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Session middleware
const authenticateSession = (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = sessions.get(sessionId);
  next();
};

// API Routes

// Auth Routes
app.post('/api/auth/create-profile', async (req, res) => {
  try {
    const { name, email, avatarUrl, role } = req.body;
    
    // Check if user already exists
    const existingUser = userOperations.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const user = userOperations.create({ name, email, avatarUrl, role });
    
    // Create session
    const sessionId = generateSessionId();
    sessions.set(sessionId, user);
    
    res.json({ user, sessionId });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = userOperations.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update last login
    const updatedUser = userOperations.updateLastLogin(user.id);
    
    // Create session
    const sessionId = generateSessionId();
    sessions.set(sessionId, updatedUser);
    
    res.json({ user: updatedUser, sessionId });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/auth/user', authenticateSession, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authenticateSession, (req, res) => {
  const sessionId = req.headers['x-session-id'];
  sessions.delete(sessionId);
  res.json({ message: 'Logged out successfully' });
});

app.delete('/api/auth/reset-profile', authenticateSession, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete user and all associated data
    userOperations.delete(userId);
    
    // Remove session
    const sessionId = req.headers['x-session-id'];
    sessions.delete(sessionId);
    
    res.json({ message: 'Profile reset successfully' });
  } catch (error) {
    console.error('Reset profile error:', error);
    res.status(500).json({ error: 'Failed to reset profile' });
  }
});

// Quiz Result Routes
app.post('/api/quiz-results', authenticateSession, (req, res) => {
  try {
    const resultData = {
      ...req.body,
      userId: req.user.id
    };
    
    const resultId = quizResultOperations.create(resultData);
    res.json({ id: resultId, message: 'Quiz result saved successfully' });
  } catch (error) {
    console.error('Save quiz result error:', error);
    res.status(500).json({ error: 'Failed to save quiz result' });
  }
});

app.get('/api/quiz-results', authenticateSession, (req, res) => {
  try {
    const results = quizResultOperations.findByUserId(req.user.id);
    res.json(results);
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Failed to get quiz results' });
  }
});

app.get('/api/profile/stats', authenticateSession, (req, res) => {
  try {
    const results = quizResultOperations.findByUserId(req.user.id);
    
    const stats = {
      totalQuizzes: results.length,
      averageScore: results.length > 0 ? 
        Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0,
      passRate: results.length > 0 ? 
        Math.round((results.filter(result => result.passed).length / results.length) * 100) : 0,
      totalTimeSpent: results.reduce((sum, result) => sum + result.timeSpent, 0),
      streak: calculateStreak(results)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ error: 'Failed to get profile stats' });
  }
});

// Admin endpoint to get user data by email
app.get('/api/admin/user/:email', (req, res) => {
  try {
    const { email } = req.params;
    
    // Find user by email
    const user = userOperations.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get quiz results for this user
    const quizResults = quizResultOperations.findByUserId(user.id);
    
    // Calculate stats
    const stats = {
      totalQuizzes: quizResults.length,
      averageScore: quizResults.length > 0 ? 
        Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length) : 0,
      passRate: quizResults.length > 0 ? 
        Math.round((quizResults.filter(result => result.passed).length / quizResults.length) * 100) : 0,
      totalTimeSpent: quizResults.reduce((sum, result) => sum + result.timeSpent, 0),
      streak: calculateStreak(quizResults)
    };
    
    res.json({
      user,
      quizResults,
      stats
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    database: 'SQLite'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test syllabus file access via API
app.get('/api/test-syllabus', async (req, res) => {
  try {
    const testPath = path.join(__dirname, '../json syllabus/OS/hard/ch1.json');
    console.log(`🧪 Testing syllabus file access: ${testPath}`);
    
    const fs = await import('fs');
    if (!fs.existsSync(testPath)) {
      return res.status(404).json({ error: 'Test file not found' });
    }
    
    const fileContent = fs.readFileSync(testPath, 'utf8');
    const questions = JSON.parse(fileContent);
    
    console.log('✅ Syllabus test successful');
    res.json({ 
      message: 'Syllabus files are accessible',
      questionCount: questions.length,
      firstQuestion: questions[0]?.question || 'No questions found'
    });
  } catch (error) {
    console.error('❌ Syllabus test failed:', error);
    res.status(500).json({ error: 'Syllabus file not accessible', details: error.message });
  }
});

// Test route to simulate syllabus file response
app.get('/api/test-json-response', (req, res) => {
  console.log('🧪 Testing JSON response');
  res.json({ 
    message: 'JSON response test',
    timestamp: new Date().toISOString(),
    test: true
  });
});

// API endpoint to serve quiz questions
app.get('/api/quiz-questions/:subject/:difficulty/:chapter', async (req, res) => {
  try {
    const { subject, difficulty, chapter } = req.params;
    console.log(`📚 Request for quiz questions: ${subject}/${difficulty}/${chapter}`);
    
    const filePath = path.join(__dirname, '..', 'json syllabus', subject, difficulty, `${chapter}.json`);
    console.log(`📁 Reading file: ${filePath}`);
    
    // Read file using fs
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return res.status(404).json({ error: 'Quiz questions not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(fileContent);
    
    console.log(`✅ Successfully loaded ${questions.length} questions`);
    res.json(questions);
  } catch (error) {
    console.error('Error loading quiz questions:', error);
    res.status(500).json({ error: 'Failed to load quiz questions' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Serve React app for all non-API routes in production (must be last)
if (process.env.NODE_ENV === 'production') {
  // Handle React routes (everything that's not API or JSON files)
  app.get('*', (req, res) => {
    console.log(`📄 Serving React app for: ${req.path}`);
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database initialized with SQLite`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Working directory: ${process.cwd()}`);
});

export default app; 