import React, { useState, useEffect } from 'react';
import { User, Clock, Award, TrendingUp, Settings, Moon, Sun, LogOut, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getLessonById } from '@/data/subjects';
import { QuizResult, ProfileStats, apiClient } from '@/lib/api';
import { getQuizResults } from '@/lib/progress-utils-api';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, resetProfile } = useAuth();
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load quiz history
        const results = await getQuizResults();
        setQuizHistory(results.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        ));

        // Load profile stats
        const stats = await apiClient.getProfileStats();
        setProfileStats(stats);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

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
        timeSpent: quiz.timeSpent,
        isFromHistory: true
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetProfile = async () => {
    if (confirm('Are you sure you want to reset your profile? This will clear all your data.')) {
      try {
        await resetProfile();
        navigate('/create-profile');
      } catch (error) {
        console.error('Failed to reset profile:', error);
        alert('Failed to reset profile. Please try again.');
      }
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

  const overallStats = profileStats || {
    totalQuizzes: quizHistory.length,
    averageScore: quizHistory.length > 0 ? 
      Math.round(quizHistory.reduce((sum, result) => sum + result.score, 0) / quizHistory.length) : 0,
    passRate: quizHistory.length > 0 ? 
      Math.round((quizHistory.filter(result => result.passed).length / quizHistory.length) * 100) : 0,
    totalTimeSpent: quizHistory.reduce((sum, result) => sum + result.timeSpent, 0),
    streak: 0
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
  const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Profile – Quizzle</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">Track your learning progress and performance</p>
        </div>

        {/* User Profile Section */}
        <Card className="quiz-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>Profile Information</span>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetProfile} className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Profile
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-lg sm:text-xl">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{user?.name || 'User'}</h3>
                <p className="text-muted-foreground mb-2">{user?.email || 'No email provided'}</p>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="quiz-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Total Quizzes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
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
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
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
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {formatTime(overallStats.totalTimeSpent)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz History Table */}
        <Card className="quiz-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle>Recent Quiz History</CardTitle>
          </CardHeader>
          <CardContent>
            {quizHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quiz history yet. Start learning to see your progress!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden sm:table-cell">Subject</TableHead>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="hidden md:table-cell">Time</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizHistory.slice(0, 10).map((result, index) => (
                      <TableRow 
                        key={index} 
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="hidden sm:table-cell">
                          {getSubjectDisplayName(result.subjectId)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-base">{result.lessonTitle}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {getSubjectDisplayName(result.subjectId)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${result.score >= 80 ? 'text-green-600' : 
                            result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.score}%
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatTime(result.timeSpent)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{new Date(result.completedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={result.passed ? 'default' : 'destructive'} className="text-xs">
                            {result.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        {quizHistory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
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
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Subject Legend */}
                <div className="mt-4 space-y-2">
                  {subjectPieData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium">{entry.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({entry.value} quiz{entry.value !== 1 ? 'es' : ''})
                      </span>
                    </div>
                  ))}
                </div>
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

        {/* Recent Activity */}
        <Card className="quiz-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizHistory.slice(0, 3).map((result, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded gap-2">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{result.lessonTitle}</span>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {getSubjectDisplayName(result.subjectId)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {result.score}%
                    </Badge>
                    <Badge variant={result.passed ? 'default' : 'destructive'} className="text-xs">
                      {result.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h4 className="font-medium mb-1">Theme</h4>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};