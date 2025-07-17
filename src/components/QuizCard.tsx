import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Target, Trophy, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizCardProps {
  title: string;
  description: string;
  duration: number;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  link: string;
  lastScore?: number;
  icon?: React.ReactNode;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  title,
  description,
  duration,
  questions,
  difficulty,
  link,
  lastScore,
  icon
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Hard':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <Card className="quiz-card group hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-primary">{icon}</div>}
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
          </div>
          {lastScore && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Trophy className="h-3 w-3 mr-1" />
              {lastScore}%
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{questions} questions</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{duration} min</span>
            </div>
          </div>
        </div>
        
        <Link to={link}>
          <Button className="w-full group-hover:bg-primary-dark transition-colors">
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Quiz
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};