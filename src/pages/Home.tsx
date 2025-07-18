import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
import { subjects } from '@/data/subjects';
import { SubjectCard } from '@/components/SubjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { calculateUserProgress, hasUserProgress } from '@/lib/progress-utils-api';

export const Home: React.FC = () => {
  const { isAuthenticated, checkAuth, user } = useAuth();
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<any>({});

  // Remove automatic redirect - let users enjoy the full home page design

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
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            {(isAuthenticated || checkAuth()) && user ? (
              <div className="mb-4 fade-in">
                <p className="text-lg text-primary">Welcome back, {user.name}! 👋</p>
              </div>
            ) : null}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in">
              Master Your <span className="gradient-text">Technical Skills</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 fade-in">
              Learn through interactive lessons and test your knowledge with comprehensive quizzes 
              across Data Analytics, Operating Systems, Entrepreneurship, and Software Engineering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <Link to="/subjects">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  {(isAuthenticated || checkAuth()) ? 'Continue Learning' : 'Start Learning'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/quiz/full-syllabus">
                <Button size="lg" variant="outline">
                  Take Full Test
                  <Target className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Subjects</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive into our comprehensive curriculum covering essential technical subjects
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
          
          <div className="text-center mt-12">
            <Link to="/subjects">
              <Button size="lg" variant="outline">
                View All Subjects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-primary text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who have mastered their technical skills with our platform
              </p>
              <Link to="/subjects">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};