import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award } from 'lucide-react';
import { Subject } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubjectCardProps {
  subject: Subject;
  progress?: {
    lessonsCompleted: number;
    totalLessons: number;
    averageScore: number;
  };
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, progress }) => {
  const getSubjectCardClass = (subjectId: string) => {
    const baseClass = 'subject-card';
    switch (subjectId) {
      case 'data-analytics':
        return `${baseClass} subject-card-data`;
      case 'operating-systems':
        return `${baseClass} subject-card-os`;
      case 'entrepreneurship':
        return `${baseClass} subject-card-entrepreneur`;
      case 'software-engineering':
        return `${baseClass} subject-card-software`;
      default:
        return baseClass;
    }
  };

  const progressPercentage = progress 
    ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)
    : 0;

  return (
    <Link to={`/subjects/${subject.id}`} className="block h-full">
      <Card className={getSubjectCardClass(subject.id)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl">{subject.icon}</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
              {subject.lessons.length} lessons
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-white">
            {subject.name}
          </CardTitle>
          <CardDescription className="text-white/80 text-sm sm:text-base">
            {subject.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-white/80 space-y-1 sm:space-y-0">
              <div className="flex items-center space-x-1">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{subject.totalQuestions} questions</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{subject.lessons.reduce((total, lesson) => total + lesson.estimatedTime, 0)} min</span>
              </div>
            </div>
            
            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-white/80">Progress</span>
                  <span className="text-white font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2">
                  <div 
                    className="bg-white h-1.5 sm:h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {progress.averageScore > 0 && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-white/80">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Avg: {progress.averageScore}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};