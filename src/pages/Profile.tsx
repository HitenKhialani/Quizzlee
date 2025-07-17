import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, Award, TrendingUp, Settings, Moon, Sun, LogOut, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getLessonById } from '@/data/subjects';
import { getQuizResults, calculateStreak, QuizResult } from '@/lib/quiz-utils';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    // Load quiz history from localStorage using the new utility
    const results = getQuizResults();
    setQuizHistory(results.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ));
    
    // Calculate streak using the new utility
    setCurrentStreak(calculateStreak(results));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSubjectDisplayName = (subjectId: string) => {
    const subjectMap: Record<string, string> = {
      'operating-systems': 'Operating Systems',
      'data-analytics': 'Data Analytics',
      'software-engineering': 'Software Engineering',
      'entrepreneurship': 'Entrepreneurship'
    };
    return subjectMap[subjectId] || subjectId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleQuizClick = (quiz: QuizResult) => {
    // Navigate to quiz report with the stored quiz data
    navigate('/quiz-report', {
      state: {
        score: Math.round((quiz.score / 100) * quiz.totalQuestions),
        total: quiz.totalQuestions,
        subject: quiz.subjectId,
        lessonTitle: quiz.lessonTitle,
        questions: quiz.questions,
        isFromHistory: true
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetProfile = () => {
    if (confirm('Are you sure you want to reset your profile? This will clear all your data.')) {
      localStorage.removeItem('quizResults');
      localStorage.removeItem('quizzle_user');
      logout();
      navigate('/create-profile');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Analytics Data
  const scoresOverTime = quizHistory.slice(0, 10).reverse().map((result, index) => ({
    quiz: `Quiz ${index + 1}`,
    score: result.score,
    date: new Date(result.completedAt).toLocaleDateString()
  }));

  const subjectDistribution = quizHistory.reduce((acc, result) => {
    acc[result.subjectId] = (acc[result.subjectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subjectPieData = Object.entries(subjectDistribution).map(([subject, count]) => ({
    name: getSubjectDisplayName(subject),
    value: count
  }));

  const averageTimeData = quizHistory.reduce((acc, result) => {
    if (!acc[result.subjectId]) {
      acc[result.subjectId] = { totalTime: 0, count: 0 };
    }
    acc[result.subjectId].totalTime += result.timeSpent;
    acc[result.subjectId].count += 1;
    return acc;
  }, {} as Record<string, { totalTime: number; count: number }>);

  const timeBarData = Object.entries(averageTimeData).map(([subject, data]) => ({
    subject: getSubjectDisplayName(subject),
    averageTime: Math.round(data.totalTime / data.count / 60) // Convert to minutes
  }));

  const overallStats = {
    totalQuizzes: quizHistory.length,
    averageScore: quizHistory.length > 0 ? 
      Math.round(quizHistory.reduce((sum, result) => sum + result.score, 0) / quizHistory.length) : 0,
    passRate: quizHistory.length > 0 ? 
      Math.round((quizHistory.filter(result => result.passed).length / quizHistory.length) * 100) : 0,
    totalTimeSpent: quizHistory.reduce((sum, result) => sum + result.timeSpent, 0)
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
  const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Profile – Quizzle</h1>
          <p className="text-xl text-muted-foreground">Track your learning progress and performance</p>
        </div>

        {/* User Profile Section */}
        <Card className="quiz-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profile Information</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetProfile}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Profile
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-xl">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{user?.name || 'User'}</h3>
                <p className="text-muted-foreground mb-2">{user?.email || 'No email provided'}</p>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">
                    {user?.role || 'Student'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="quiz-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Total Quizzes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {overallStats.totalQuizzes}
              </div>
            </CardContent>
          </Card>

          <Card className="quiz-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Average Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {overallStats.averageScore}%
              </div>
            </CardContent>
          </Card>

          <Card className="quiz-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Time Spent</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(overallStats.totalTimeSpent)}
              </div>
            </CardContent>
          </Card>

          <Card className="quiz-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Current Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {currentStreak} days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz History Table */}
        <Card className="quiz-card mb-8">
          <CardHeader>
            <CardTitle>Quiz History</CardTitle>
          </CardHeader>
          <CardContent>
            {quizHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quiz history yet. Start taking quizzes to see your progress!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizHistory.slice(0, 10).map((result, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        {getSubjectDisplayName(result.subjectId)}
                      </TableCell>
                      <TableCell>{result.lessonTitle}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${result.score >= 80 ? 'text-green-600' : 
                          result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {result.score}%
                        </span>
                      </TableCell>
                      <TableCell>{formatTime(result.timeSpent)}</TableCell>
                      <TableCell>{new Date(result.completedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={result.passed ? 'default' : 'destructive'}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuizClick(result)}
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        {quizHistory.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Scores Over Time */}
            <Card className="quiz-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Scores Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoresOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="quiz" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card className="quiz-card">
              <CardHeader>
                <CardTitle>Subject Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Time by Subject */}
            <Card className="quiz-card lg:col-span-3">
              <CardHeader>
                <CardTitle>Average Time per Quiz by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeBarData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Bar 
                      dataKey="averageTime" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    >
                      {timeBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Streak & Activity */}
        <Card className="quiz-card mb-8">
          <CardHeader>
            <CardTitle>Activity & Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Current Streak</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-orange-600">
                    {currentStreak}
                  </div>
                  <div className="text-muted-foreground">
                    {currentStreak === 1 ? 'day' : 'days'} of consistent learning
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {quizHistory.slice(0, 3).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{result.lessonTitle}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Settings */}
        <Card className="quiz-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center space-x-2"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Profile Customization</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize your learning experience
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};