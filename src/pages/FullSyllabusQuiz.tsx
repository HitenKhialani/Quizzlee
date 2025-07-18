import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizState, QuizQuestion, SubjectType } from '../types/quiz';
import { loadFullSyllabusQuiz, shuffleQuestions } from '../data/questions';
import { saveQuizResult } from '../lib/progress-utils-api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Target, Brain, Trophy, Award, AlertTriangle, Save, Eye, X, RotateCcw } from 'lucide-react';

interface QuestionStatus {
  answered: boolean;
  markedForReview: boolean;
  visited: boolean;
}

export default function FullSyllabusQuiz() {
  const navigate = useNavigate();
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    questions: [],
    selectedAnswer: null,
    score: 0,
    isComplete: false
  });

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<number, QuestionStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showNavigationPanel, setShowNavigationPanel] = useState(true);
  const [subjectScores, setSubjectScores] = useState<Record<SubjectType, number>>({
    'operating-systems': 0,
    'data-analytics': 0,
    'software-engineering': 0,
    'entrepreneurship': 0
  });

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const questions = await loadFullSyllabusQuiz();
        
        if (questions.length === 0) {
          setError('No questions found for the full syllabus quiz');
        } else {
          setQuizState(prev => ({
            ...prev,
            questions: questions
          }));
          
          // Initialize question status
          const initialStatus: Record<number, QuestionStatus> = {};
          questions.forEach((_, index) => {
            initialStatus[index] = {
              answered: false,
              markedForReview: false,
              visited: false
            };
          });
          setQuestionStatus(initialStatus);
        }
      } catch (err) {
        setError('Failed to load quiz questions');
        console.error('Error loading quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!loading && quizState.questions.length > 0 && !quizState.isComplete) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, quizState.questions.length, quizState.isComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (quizState.isComplete) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          const optionIndex = parseInt(event.key) - 1;
          const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
          if (currentQuestion && optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
            handleAnswerSelect(currentQuestion.options[optionIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quizState.currentQuestionIndex, quizState.isComplete, quizState.questions]);

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const progress = quizState.questions.length > 0 
    ? (quizState.currentQuestionIndex / quizState.questions.length) * 100 
    : 0;

  // Get current subject for notification
  const getCurrentSubject = (): string => {
    if (!currentQuestion?.subject) return '';
    
    const subjectMap = {
      'operating-systems': 'Operating Systems',
      'data-analytics': 'Data Analytics',
      'software-engineering': 'Software Engineering',
      'entrepreneurship': 'Entrepreneurship'
    };
    
    return subjectMap[currentQuestion.subject] || '';
  };

  // Get subject color for styling
  const getSubjectColor = (): string => {
    if (!currentQuestion?.subject) return 'bg-gray-500';
    
    const colorMap = {
      'operating-systems': 'bg-green-500',
      'data-analytics': 'bg-blue-500',
      'software-engineering': 'bg-purple-500',
      'entrepreneurship': 'bg-orange-500'
    };
    
    return colorMap[currentQuestion.subject] || 'bg-gray-500';
  };

  // Load user's previous answer for current question
  useEffect(() => {
    const previousAnswer = userAnswers[quizState.currentQuestionIndex];
    if (previousAnswer) {
      setQuizState(prev => ({
        ...prev,
        selectedAnswer: previousAnswer
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        selectedAnswer: null
      }));
    }
    
    // Mark question as visited
    setQuestionStatus(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: {
        ...prev[quizState.currentQuestionIndex],
        visited: true
      }
    }));
  }, [quizState.currentQuestionIndex, userAnswers]);

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer
    }));
  };

  const handleSaveAndNext = () => {
    if (quizState.selectedAnswer === null) return;

    // Save user's answer
    setUserAnswers(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: quizState.selectedAnswer
    }));

    // Mark question as answered
    setQuestionStatus(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: {
        ...prev[quizState.currentQuestionIndex],
        answered: true,
        markedForReview: false
      }
    }));

    const isCorrect = quizState.selectedAnswer === currentQuestion.answer;
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;
    
    // Update subject scores
    if (currentQuestion.subject) {
      setSubjectScores(prev => ({
        ...prev,
        [currentQuestion.subject]: prev[currentQuestion.subject] + (isCorrect ? 1 : 0)
      }));
    }
    
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        score: newScore
      }));
    }
  };

  const handleMarkForReview = () => {
    if (quizState.selectedAnswer === null) return;

    // Save user's answer
    setUserAnswers(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: quizState.selectedAnswer
    }));

    // Mark question for review
    setQuestionStatus(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: {
        ...prev[quizState.currentQuestionIndex],
        answered: true,
        markedForReview: true
      }
    }));

    const isCorrect = quizState.selectedAnswer === currentQuestion.answer;
    const updatedScore = isCorrect ? quizState.score + 1 : quizState.score;
    
    // Update subject scores
    if (currentQuestion.subject) {
      setSubjectScores(prev => ({
        ...prev,
        [currentQuestion.subject]: prev[currentQuestion.subject] + (isCorrect ? 1 : 0)
      }));
    }
    
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        score: updatedScore
      }));
    }
  };

  const handleClearSelection = () => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: null
    }));
    
    // Remove answer from userAnswers
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[quizState.currentQuestionIndex];
      return newAnswers;
    });

    // Mark question as unanswered
    setQuestionStatus(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: {
        ...prev[quizState.currentQuestionIndex],
        answered: false,
        markedForReview: false
      }
    }));
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handleQuestionNavigation = (questionIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    setQuizState(prev => ({
      ...prev,
      isComplete: true
    }));

    // Calculate final score
    let finalScore = 0;
    Object.entries(userAnswers).forEach(([questionIndex, userAnswer]) => {
      const question = quizState.questions[parseInt(questionIndex)];
      if (question && userAnswer === question.answer) {
        finalScore++;
      }
    });

    // Prepare questions with user answers for the report
    const questionsWithAnswers = quizState.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      userAnswer: userAnswers[index] || null,
      subject: q.subject
    }));

    // Save quiz result to API for profile tracking
    const percentage = Math.round((finalScore / quizState.questions.length) * 100);
    const passed = percentage >= 60;
    
    try {
      await saveQuizResult({
        subjectId: 'full-syllabus',
        lessonTitle: 'Full Syllabus Quiz',
        score: percentage,
        totalQuestions: quizState.questions.length,
        timeSpent: timeSpent,
        selectedAnswers: userAnswers,
        questions: questionsWithAnswers,
        passed: passed,
        quizType: 'full-syllabus'
      });
    } catch (error) {
      console.error('Failed to save quiz result:', error);
    }

    navigate('/quiz-report', { 
      state: { 
        score: finalScore, 
        total: quizState.questions.length,
        subject: 'full-syllabus',
        lessonTitle: 'Full Syllabus Quiz',
        questions: questionsWithAnswers,
        subjectScores: subjectScores
      } 
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatusColor = (questionIndex: number): string => {
    const status = questionStatus[questionIndex];
    if (!status) return 'bg-gray-200 dark:bg-gray-700';
    
    if (status.markedForReview) return 'bg-yellow-400 dark:bg-yellow-500';
    if (status.answered) return 'bg-blue-400 dark:bg-blue-500';
    if (status.visited) return 'bg-gray-300 dark:bg-gray-600';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  const getQuestionStatusText = (questionIndex: number): string => {
    const status = questionStatus[questionIndex];
    if (!status) return 'Not visited';
    
    if (status.markedForReview) return 'Marked for review';
    if (status.answered) return 'Answered';
    if (status.visited) return 'Visited';
    return 'Not visited';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-200 animate-pulse"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Full Syllabus Quiz</h2>
          <p className="text-gray-600">Preparing your comprehensive assessment across all subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md mx-4">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/subjects')} className="w-full">
              Back to Subjects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/subjects')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Subjects</span>
            </Button>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(timeSpent)}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>{quizState.currentQuestionIndex + 1}/{quizState.questions.length}</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigationPanel(!showNavigationPanel)}
              >
                {showNavigationPanel ? 'Hide' : 'Show'} Navigation
              </Button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Main Quiz Content */}
            <div className={`flex-1 ${showNavigationPanel ? 'mr-4' : ''}`}>
              {/* Subject Notification */}
              {currentQuestion?.subject && (
                <Alert className="mb-6 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center space-x-2">
                    <span>Currently testing:</span>
                    <Badge className={`${getSubjectColor()} text-white`}>
                      {getCurrentSubject()}
                    </Badge>
                  </AlertDescription>
                </Alert>
              )}

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question Card */}
              <Card className="mb-8">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Brain className="h-3 w-3" />
                      <span>Question {quizState.currentQuestionIndex + 1}</span>
                    </Badge>
                  </div>

                  <h2 className="text-xl font-semibold mb-8 leading-relaxed">
                    {currentQuestion?.question}
                  </h2>

                  <div className="space-y-4 mb-8">
                    {currentQuestion?.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full justify-start p-4 h-auto text-left transition-all duration-200 ${
                          quizState.selectedAnswer === option 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1 ${
                            quizState.selectedAnswer === option 
                              ? 'border-blue-500 bg-blue-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1 text-left leading-relaxed">{option}</span>
                          {quizState.selectedAnswer === option && (
                            <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={quizState.currentQuestionIndex === 0}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleClearSelection}
                        disabled={quizState.selectedAnswer === null}
                        className="flex items-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Clear</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleMarkForReview}
                        disabled={quizState.selectedAnswer === null}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Mark for Review</span>
                      </Button>
                      
                      <Button
                        onClick={handleSaveAndNext}
                        disabled={quizState.selectedAnswer === null}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                      >
                        <Save className="h-4 w-4" />
                        <span>{quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Save & Submit' : 'Save & Next'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Bottom Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={quizState.currentQuestionIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowSubmitDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Trophy className="h-4 w-4" />
                  <span>Submit Quiz</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={quizState.currentQuestionIndex === quizState.questions.length - 1}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Question Navigation Panel */}
            {showNavigationPanel && (
              <div className="w-80 flex-shrink-0">
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Question Navigation</h3>
                    <div className="grid grid-cols-10 gap-1 mb-4">
                      {quizState.questions.map((_, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuestionNavigation(index)}
                              className={`w-8 h-8 p-0 text-xs ${
                                index === quizState.currentQuestionIndex 
                                  ? 'ring-2 ring-blue-500' 
                                  : ''
                              } ${getQuestionStatusColor(index)}`}
                            >
                              {index + 1}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Question {index + 1}: {getQuestionStatusText(index)}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded"></div>
                        <span>Answered</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                        <span>Marked for Review</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span>Visited</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <span>Not Visited</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Quiz</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSubmitDialog(false);
                handleSubmitQuiz();
              }}>
                Submit Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
} 