import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Clock, Award } from 'lucide-react';
import { getSubjectById } from '@/data/subjects';
import { LessonCard } from '@/components/LessonCard';
import { QuizCard } from '@/components/QuizCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getLessonProgress, getSubjectProgress, hasUserProgress } from '@/lib/progress-utils-api';

export const SubjectDetail: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { isAuthenticated, checkAuth } = useAuth();
  const [lessonProgress, setLessonProgress] = useState<any>({});
  const [subjectProgress, setSubjectProgress] = useState<any>(null);
  const subject = subjectId ? getSubjectById(subjectId) : null;

  useEffect(() => {
    const loadProgress = async () => {
      const isUserAuthenticated = isAuthenticated || checkAuth();
      if (isUserAuthenticated && await hasUserProgress() && subjectId) {
        try {
          const lessonProg = await getLessonProgress(subjectId);
          const subjectProg = await getSubjectProgress(subjectId);
          setLessonProgress(lessonProg);
          setSubjectProgress(subjectProg);
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      }
    };

    loadProgress();
  }, [isAuthenticated, checkAuth, subjectId]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Subject Not Found</h1>
          <Link to="/subjects">
            <Button>Back to Subjects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalTime = subject.lessons.reduce((sum, lesson) => sum + lesson.estimatedTime, 0);
  const completedLessons = lessonProgress && Object.keys(lessonProgress).length > 0
    ? Object.values(lessonProgress).filter((p: any) => p.completed).length 
    : 0;
  const progressPercentage = subject.lessons.length > 0 
    ? Math.round((completedLessons / subject.lessons.length) * 100) 
    : 0;

  const quizDetails = {
    'data-analytics': {
      description: 'Test your knowledge across all Data Analytics concepts. 30 questions with 20-minute time limit.',
      duration: 20,
      questions: 30,
      link: '/subject-quiz/data-analytics'
    },
    'operating-systems': {
      description: 'Comprehensive quiz covering Operating Systems fundamentals. 30 questions with 20-minute time limit.',
      duration: 20,
      questions: 30,
      link: '/subject-quiz/operating-systems'
    },
    'entrepreneurship': {
      description: 'Evaluate your understanding of entrepreneurship principles. 30 questions with 20-minute time limit.',
      duration: 20,
      questions: 30,
      link: '/subject-quiz/entrepreneurship'
    },
    'software-engineering': {
      description: 'Challenge yourself with software engineering best practices. 30 questions with 20-minute time limit.',
      duration: 20,
      questions: 30,
      link: '/subject-quiz/software-engineering'
    }
  }[subjectId] || {
    description: 'Test your knowledge of this subject. 30 questions with 20-minute time limit.',
    duration: 20,
    questions: 30,
    link: `/subject-quiz/${subjectId}`
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/subjects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-6xl">{subject.icon}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
              <p className="text-xl text-muted-foreground">{subject.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="secondary" className="text-sm">
              <BookOpen className="h-4 w-4 mr-1" />
              {subject.lessons.length} lessons
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Target className="h-4 w-4 mr-1" />
              {subject.totalQuestions} questions
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {totalTime} min total
            </Badge>
            {(lessonProgress && Object.keys(lessonProgress).length > 0) && (
              <Badge variant="secondary" className="text-sm">
                <Award className="h-4 w-4 mr-1" />
                {progressPercentage}% complete
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Overview - only show if user has progress */}
        {(lessonProgress && Object.keys(lessonProgress).length > 0) && (
          <div className="mb-8">
            <Card className="quiz-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lessons Completed</span>
                    <span>{completedLessons}/{subject.lessons.length}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {subjectProgress && subjectProgress.averageScore > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span>Average Score</span>
                      <span>{subjectProgress.averageScore}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Side - Lessons */}
          <div className="lg:col-span-3">
            {/* Lessons */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Lessons</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subject.lessons.map((lesson) => {
                  const progress = lessonProgress[lesson.id];
                  return (
                    <LessonCard 
                      key={lesson.id}
                      lesson={lesson}
                      isCompleted={progress?.isCompleted || false}
                      score={progress?.score}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Subject Quiz */}
          <div className="lg:col-span-1">
            <div>
              <h2 className="text-2xl font-bold mb-6">Subject Quiz</h2>
              <QuizCard
                title="Subject Quiz"
                description={quizDetails.description}
                duration={quizDetails.duration}
                questions={quizDetails.questions}
                link={quizDetails.link}
                icon={<Target className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};