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

// Test syllabus file access
app.get('/api/test-syllabus', (req, res) => {
  const testPath = path.join(__dirname, '../json syllabus/OS/hard/ch1.json');
  console.log(`🧪 Testing syllabus file access: ${testPath}`);
  
  res.sendFile(testPath, (err) => {
    if (err) {
      console.error('❌ Syllabus test failed:', err);
      res.status(500).json({ error: 'Syllabus file not accessible', details: err.message });
    } else {
      console.log('✅ Syllabus test successful');
      res.json({ message: 'Syllabus files are accessible' });
    }
  });
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

// Debug route to catch all syllabus requests
app.get('/json syllabus/*', (req, res) => {
  console.log(`🔍 DEBUG: Syllabus request received`);
  console.log(`🔍 Path: ${req.path}`);
  console.log(`🔍 URL: ${req.url}`);
  console.log(`🔍 Original URL: ${req.originalUrl}`);
  console.log(`🔍 Method: ${req.method}`);
  console.log(`🔍 Headers:`, req.headers);
  
  // Parse the path to extract subject, difficulty, chapter
  const pathParts = req.path.split('/').filter(part => part.length > 0);
  console.log(`🔍 Path parts:`, pathParts);
  
  if (pathParts.length >= 4) {
    const [, , subject, difficulty, chapterFile] = pathParts;
    const chapter = chapterFile?.replace('.json', '');
    
    console.log(`🔍 Parsed: subject=${subject}, difficulty=${difficulty}, chapter=${chapter}`);
    
    if (subject && difficulty && chapter) {
      const filePath = path.join(__dirname, '..', 'json syllabus', subject, difficulty, `${chapter}.json`);
      console.log(`🔍 Full file path: ${filePath}`);
      
      // Check if file exists
      import('fs').then(fs => {
        if (!fs.existsSync(filePath)) {
          console.error(`❌ File not found: ${filePath}`);
          return res.status(404).json({ error: 'Syllabus file not found', path: filePath });
        }
        
        console.log(`✅ File exists, serving: ${filePath}`);
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error('Error serving syllabus file:', err);
            res.status(404).json({ error: 'Syllabus file not found' });
          } else {
            console.log(`✅ Successfully served: ${req.path}`);
          }
        });
      });
    } else {
      console.error(`❌ Invalid path structure: ${req.path}`);
      res.status(404).json({ error: 'Invalid syllabus file path' });
    }
  } else {
    console.error(`❌ Path too short: ${req.path}`);
    res.status(404).json({ error: 'Invalid syllabus file path' });
  }
});

// Fallback route for any other syllabus file requests
app.get('/json syllabus/*', (req, res) => {
  console.log(`📁 Fallback request for syllabus file: ${req.path}`);
  const filePath = path.join(__dirname, '..', req.path);
  console.log(`📁 Full file path: ${filePath}`);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving syllabus file:', err);
      res.status(404).json({ error: 'Syllabus file not found' });
    } else {
      console.log(`✅ Successfully served: ${req.path}`);
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Serve React app for all non-API routes in production (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Skip API routes and syllabus files
    if (req.path.startsWith('/api/') || req.path.startsWith('/json syllabus/')) {
      console.log(`🚫 Blocked request to: ${req.path}`);
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    
    console.log(`📄 Serving React app for: ${req.path}`);
    // Serve React app for all other routes
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