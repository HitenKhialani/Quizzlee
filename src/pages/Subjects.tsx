import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Target, Clock, HelpCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Subjects</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a subject to start your learning journey. Each subject contains comprehensive lessons and quizzes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready for the Ultimate Challenge?</h2>
            <p className="text-muted-foreground">
              Test your knowledge across all subjects with our comprehensive full syllabus quiz.
            </p>
          </div>
          
          <Card className="quiz-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Full Syllabus Test</CardTitle>
              <CardDescription>
                Comprehensive assessment covering all four subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span>100 questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>120 min</span>
                </div>
                <Badge variant="destructive" className="text-xs">Hard</Badge>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Questions from Data Analytics, Operating Systems, Software Engineering & Entrepreneurship
                </p>
                <Link to="/quiz/full-syllabus" className="block">
                  <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                    <Target className="mr-2 h-4 w-4" />
                    Start Full Test
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};