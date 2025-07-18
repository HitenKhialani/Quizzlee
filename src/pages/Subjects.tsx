import React from 'react';
import { subjects } from '@/data/subjects';
import { SubjectCard } from '@/components/SubjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { calculateUserProgress, hasUserProgress } from '@/lib/progress-utils';

export const Subjects: React.FC = () => {
  const { isAuthenticated, checkAuth } = useAuth();

  // Calculate dynamic progress only for authenticated users
  const userProgress = (isAuthenticated || checkAuth()) && hasUserProgress() 
    ? calculateUserProgress() 
    : {};

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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="slide-up">
              <SubjectCard 
                subject={subject} 
                progress={getProgressForSubject(subject.id)} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};