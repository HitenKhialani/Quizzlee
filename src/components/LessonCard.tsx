import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Play } from 'lucide-react';
import { Lesson } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
  score?: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCompleted, score }) => {
  return (
    <Card className="quiz-card group hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Lesson {lesson.order}
          </Badge>
          {isCompleted && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {score && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {score}%
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-semibold">{lesson.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {lesson.content}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>5 quiz questions</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link to={`/quiz/${encodeURIComponent(lesson.title)}`} className="w-full">
            <Button className="w-full group-hover:bg-primary-dark transition-colors">
              <Play className="h-4 w-4 mr-2" />
              Quiz
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};