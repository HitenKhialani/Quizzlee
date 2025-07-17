import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Clock, Award } from 'lucide-react';
import { getSubjectById } from '@/data/subjects';
import { LessonCard } from '@/components/LessonCard';
import { QuizCard } from '@/components/QuizCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SubjectDetail: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = subjectId ? getSubjectById(subjectId) : null;

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

  const mockLessonProgress = {
    'da-1': { isCompleted: true, score: 88 },
    'da-2': { isCompleted: true, score: 92 },
    'da-3': { isCompleted: true, score: 85 },
    'da-4': { isCompleted: false, score: undefined },
    'da-5': { isCompleted: false, score: undefined },
  };

  const totalTime = subject.lessons.reduce((sum, lesson) => sum + lesson.estimatedTime, 0);
  const completedLessons = Object.values(mockLessonProgress).filter(p => p.isCompleted).length;
  const progressPercentage = Math.round((completedLessons / subject.lessons.length) * 100);

  // Determine quiz details based on subject
  const getQuizDetails = () => {
    if (subjectId === 'operating-systems') {
      return {
        questions: 30,
        duration: 45,
        difficulty: 'Hard' as const,
        link: `/subject-quiz/${subjectId}`,
        description: 'Test your knowledge across all OS topics with 30 questions'
      };
    }
    if (subjectId === 'data-analytics') {
      return {
        questions: 30,
        duration: 45,
        difficulty: 'Hard' as const,
        link: `/subject-quiz/${subjectId}`,
        description: 'Test your knowledge across all Data Analytics topics with 30 questions'
      };
    }
    if (subjectId === 'software-engineering') {
      return {
        questions: 30,
        duration: 45,
        difficulty: 'Hard' as const,
        link: `/subject-quiz/${subjectId}`,
        description: 'Test your knowledge across all Software Engineering topics with 30 questions'
      };
    }
    if (subjectId === 'entrepreneurship') {
      return {
        questions: 28,
        duration: 45,
        difficulty: 'Hard' as const,
        link: `/subject-quiz/${subjectId}`,
        description: 'Test your knowledge across all Entrepreneurship topics with 28 questions'
      };
    }
    return {
      questions: 25,
      duration: 30,
      difficulty: 'Medium' as const,
      link: `/quiz/subject/${subject.id}`,
      description: 'Test your knowledge across all lessons'
    };
  };

  const quizDetails = getQuizDetails();

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
            <Badge variant="secondary" className="text-sm">
              <Award className="h-4 w-4 mr-1" />
              {progressPercentage}% complete
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
              </div>
            </CardContent>
          </Card>

          <QuizCard
            title="Subject Quiz"
            description={quizDetails.description}
            duration={quizDetails.duration}
            questions={quizDetails.questions}
            difficulty={quizDetails.difficulty}
            link={quizDetails.link}
            icon={<Target className="h-5 w-5" />}
          />

          <QuizCard
            title="Full Syllabus Test"
            description="Comprehensive test across all subjects"
            duration={120}
            questions={100}
            difficulty="Hard"
            link="/quiz/full-syllabus"
            icon={<Award className="h-5 w-5" />}
          />
        </div>

        {/* Lessons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Lessons</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subject.lessons.map((lesson) => (
              <LessonCard 
                key={lesson.id}
                lesson={lesson}
                isCompleted={mockLessonProgress[lesson.id as keyof typeof mockLessonProgress]?.isCompleted}
                score={mockLessonProgress[lesson.id as keyof typeof mockLessonProgress]?.score}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};