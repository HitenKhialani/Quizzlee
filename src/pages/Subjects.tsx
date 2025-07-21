import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Target, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { subjects } from '@/data/subjects';
import { SubjectCard } from '@/components/SubjectCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { calculateUserProgress, hasUserProgress } from '@/lib/progress-utils-api';

export const Subjects: React.FC = () => {
  const { isAuthenticated, checkAuth } = useAuth();
  const [userProgress, setUserProgress] = useState<any>({});

  useEffect(() => {
    // Calculate dynamic progress only for authenticated users
    const loadProgress = async () => {
      if ((isAuthenticated || checkAuth()) && await hasUserProgress()) {
        const progress = await calculateUserProgress();
        setUserProgress(progress);
      }
    };

    loadProgress();
  }, [isAuthenticated, checkAuth]);

  // Transform progress data to match SubjectCard expected format
  const getProgressForSubject = (subjectId: string) => {
    const progress = userProgress[subjectId];
    if (!progress || progress.totalQuizzesTaken === 0) {
      return undefined; // Don't show progress if user hasn't taken any quizzes
    }
    
    return {
      lessonsCompleted: progress.lessonsCompleted,
      totalLessons: progress.totalLessons,
      averageScore: progress.averageScore
    };
  };

  return (
    <div className="min-h-screen bg-gradient-background py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Subjects</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a subject to start your learning journey. Each subject contains comprehensive lessons and quizzes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {subjects.map((subject) => (
            <div key={subject.id} className="slide-up">
              <SubjectCard 
                subject={subject} 
                progress={getProgressForSubject(subject.id)} 
              />
            </div>
          ))}
        </div>

        {/* Full Syllabus Test Section */}
        <div className="text-center">
          <Card className="quiz-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <span>Full Syllabus Assessment</span>
              </CardTitle>
              <CardDescription className="text-base">
                Test your knowledge across all subjects with our comprehensive full syllabus quiz. 100 questions with 60-minute time limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>100 Questions</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>60 Minutes</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span>All Subjects</span>
                </div>
              </div>
              <Link to="/quiz/full-syllabus" className="block">
                <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Start Full Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};