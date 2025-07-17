import React from 'react';
import { subjects } from '@/data/subjects';
import { SubjectCard } from '@/components/SubjectCard';

export const Subjects: React.FC = () => {
  const mockProgress = {
    'data-analytics': { lessonsCompleted: 3, totalLessons: 5, averageScore: 85 },
    'operating-systems': { lessonsCompleted: 2, totalLessons: 5, averageScore: 78 },
    'entrepreneurship': { lessonsCompleted: 4, totalLessons: 5, averageScore: 92 },
    'software-engineering': { lessonsCompleted: 1, totalLessons: 5, averageScore: 88 }
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
                progress={mockProgress[subject.id as keyof typeof mockProgress]} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};