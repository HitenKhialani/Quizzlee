import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizState, QuizQuestion } from '../types/quiz';
import { loadOSSubjectQuizBalanced, loadDASubjectQuizBalanced, loadSESubjectQuizBalanced, loadENTSubjectQuizBalanced, shuffleQuestions } from '../data/questions';
import { saveQuizResult } from '../lib/progress-utils-api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Target, Brain, Trophy, Award, Save, Bookmark, X, Check, AlertCircle } from 'lucide-react';

export default function SubjectQuiz() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    questions: [],
    selectedAnswer: null,
    score: 0,
    isComplete: false
  });

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Time constraints
  const TIME_LIMIT = 20 * 60; // 20 minutes in seconds
  const QUESTION_COUNT = 30;

  useEffect(() => {
    const loadQuiz = async () => {
      if (subjectId !== 'operating-systems' && subjectId !== 'data-analytics' && subjectId !== 'software-engineering' && subjectId !== 'entrepreneurship') {
        setError('Subject quiz only available for Operating Systems, Data Analytics, Software Engineering, and Entrepreneurship');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let questions: QuizQuestion[] = [];
        
        if (subjectId === 'operating-systems') {
          questions = await loadOSSubjectQuizBalanced();
        } else if (subjectId === 'data-analytics') {
          questions = await loadDASubjectQuizBalanced();
        } else if (subjectId === 'software-engineering') {
          questions = await loadSESubjectQuizBalanced();
        } else if (subjectId === 'entrepreneurship') {
          questions = await loadENTSubjectQuizBalanced();
        }
        
        if (questions.length === 0) {
          setError('No questions found for this subject');
        } else {
          setQuizState(prev => ({
            ...prev,
            questions: questions // Already shuffled in the function
          }));
        }
      } catch (err) {
        setError('Failed to load quiz questions');
        console.error('Error loading quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [subjectId]);

  // Timer effect with time limit
  useEffect(() => {
    if (!loading && quizState.questions.length > 0 && !quizState.isComplete) {
      const timer = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          
          // Show warning when 5 minutes remaining
          if (newTime === TIME_LIMIT - 300) {
            setShowTimeWarning(true);
          }
          
          // Auto-submit when time expires
          if (newTime >= TIME_LIMIT) {
            handleSubmitQuiz();
            return TIME_LIMIT;
          }
          
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, quizState.questions.length, quizState.isComplete]);

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const progress = quizState.questions.length > 0 
    ? (quizState.currentQuestionIndex / quizState.questions.length) * 100 
    : 0;

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
  }, [quizState.currentQuestionIndex, userAnswers]);

  // Keyboard navigation
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (quizState.isComplete) return;

    switch (event.key) {
      case 'ArrowLeft':
        if (quizState.currentQuestionIndex > 0) {
          handleSaveAndNext();
        }
        break;
      case 'ArrowRight':
        if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
          handleSaveAndNext();
        }
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        const optionIndex = parseInt(event.key) - 1;
        if (optionIndex >= 0 && optionIndex < currentQuestion?.options.length) {
          handleAnswerSelect(currentQuestion.options[optionIndex]);
        }
        break;
      case 'Enter':
        if (quizState.selectedAnswer) {
          if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
            setShowSubmitModal(true);
          } else {
            handleSaveAndNext();
          }
        }
        break;
      case 'Escape':
        setShowNavigationPanel(prev => !prev);
        break;
    }
  }, [quizState, currentQuestion]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer
    }));
    
    // Immediately save the answer to userAnswers
    setUserAnswers(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: answer
    }));
  };

  const handleClearSelection = () => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: null
    }));
    
    // Remove the answer from userAnswers
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[quizState.currentQuestionIndex];
      return newAnswers;
    });
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizState.currentQuestionIndex)) {
        newSet.delete(quizState.currentQuestionIndex);
      } else {
        newSet.add(quizState.currentQuestionIndex);
      }
      return newSet;
    });
  };

  const handleSaveAndNext = () => {
    if (quizState.selectedAnswer === null) return;

    // Save user's answer
    setUserAnswers(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: quizState.selectedAnswer
    }));

    const isCorrect = quizState.selectedAnswer === currentQuestion.answer;
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;

    if (isLastQuestion) {
      setShowSubmitModal(true);
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        score: newScore
      }));
    }
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      // Save current answer before moving back
      if (quizState.selectedAnswer) {
        setUserAnswers(prev => ({
          ...prev,
          [quizState.currentQuestionIndex]: quizState.selectedAnswer
        }));
      }
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleSubmitQuiz = async () => {
    // Save final answer if not already saved
    if (quizState.selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [quizState.currentQuestionIndex]: quizState.selectedAnswer
      }));
    }

    // Calculate final score
    let finalScore = 0;
    quizState.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer && userAnswer === question.answer) {
        finalScore++;
      }
    });

    // Prepare questions with user answers for the report
    const questionsWithAnswers = quizState.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      userAnswer: userAnswers[index] || null
    }));

    // Save quiz result to API for profile tracking
    const percentage = Math.round((finalScore / quizState.questions.length) * 100);
    const passed = percentage >= 60;
    
    try {
      await saveQuizResult({
        subjectId: subjectId || '',
        lessonTitle: `${subjectId === 'operating-systems' ? 'Operating Systems' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'} Subject Quiz`,
        score: percentage,
        totalQuestions: quizState.questions.length,
        timeSpent: timeSpent,
        selectedAnswers: userAnswers,
        questions: questionsWithAnswers,
        passed: passed,
        quizType: 'subject'
      });
    } catch (error) {
      console.error('Failed to save quiz result:', error);
    }

    navigate('/quiz-report', { 
      state: { 
        score: finalScore, 
        total: quizState.questions.length,
        subject: subjectId,
        lessonTitle: `${subjectId === 'operating-systems' ? 'Operating Systems' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'} Subject Quiz`,
        questions: questionsWithAnswers,
        timeSpent: timeSpent
      } 
    });
  };

  const navigateToQuestion = (questionIndex: number) => {
    // Save current answer before navigating
    if (quizState.selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [quizState.currentQuestionIndex]: quizState.selectedAnswer
      }));
    }
    
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex,
      selectedAnswer: userAnswers[questionIndex] || null
    }));
  };

  const getQuestionStatus = (questionIndex: number) => {
    if (markedForReview.has(questionIndex)) return 'marked';
    if (userAnswers[questionIndex]) return 'answered';
    return 'unanswered';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRemainingTime = (seconds: number) => {
    const remaining = TIME_LIMIT - seconds;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-200 animate-pulse"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Subject Quiz</h2>
          <p className="text-gray-600">Preparing your comprehensive {subjectId === 'operating-systems' ? 'OS' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'} assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/subjects/${subjectId}`)}>
            Back to {subjectId === 'operating-systems' ? 'OS' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'}
          </Button>
        </div>
      </div>
    );
  }

  if (quizState.questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-4">No quiz questions found for this subject.</p>
          <Button onClick={() => navigate(`/subjects/${subjectId}`)}>
            Back to {subjectId === 'operating-systems' ? 'OS' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {subjectId === 'operating-systems' ? 'Operating Systems' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'} Subject Quiz
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive assessment across all {subjectId === 'operating-systems' ? 'OS' : subjectId === 'data-analytics' ? 'Data Analytics' : subjectId === 'software-engineering' ? 'Software Engineering' : 'Entrepreneurship'} topics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={`flex items-center space-x-1 ${timeSpent >= TIME_LIMIT - 300 ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200' : ''}`}>
                <Clock className="h-4 w-4" />
                <span>{formatRemainingTime(timeSpent)} remaining</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{Object.keys(userAnswers).length}/{quizState.questions.length}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Award className="h-4 w-4" />
                <span>Subject Quiz</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigationPanel(prev => !prev)}
                className="flex items-center space-x-2"
              >
                <span>Navigation</span>
                <span className="text-xs">(ESC)</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            {/* Enhanced Question Card */}
            <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Question {quizState.currentQuestionIndex + 1}</span>
                  {markedForReview.has(quizState.currentQuestionIndex) && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Bookmark className="h-3 w-3 mr-1" />
                      Marked
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-semibold leading-relaxed">{currentQuestion.question}</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={quizState.selectedAnswer === option ? "default" : "outline"}
                    className={`w-full text-left justify-start h-auto min-h-[60px] py-4 px-6 transition-all duration-200 hover:scale-[1.02] ${
                      quizState.selectedAnswer === option 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    <div className="quiz-option-container">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium quiz-option-circle ${
                        quizState.selectedAnswer === option 
                          ? 'border-white bg-white/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="quiz-option-content">{option}</span>
                      {quizState.selectedAnswer === option && (
                        <CheckCircle className="h-5 w-5 text-white quiz-option-icon" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={quizState.currentQuestionIndex === 0}
                  className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearSelection}
                  disabled={quizState.selectedAnswer === null}
                  className="flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Selection</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMarkForReview}
                  className={`flex items-center space-x-2 ${
                    markedForReview.has(quizState.currentQuestionIndex)
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>{markedForReview.has(quizState.currentQuestionIndex) ? 'Unmark' : 'Mark for Review'}</span>
                </Button>

                <Button
                  onClick={handleSaveAndNext}
                  disabled={quizState.selectedAnswer === null}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  <span>{quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Save & Submit' : 'Save & Next'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">1-4</kbd> Select option</div>
                  <div>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">←/→</kbd> Navigate</div>
                  <div>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Enter</kbd> Save & Next</div>
                  <div>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">ESC</kbd> Toggle Navigation</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Question Navigation Panel */}
          {showNavigationPanel && (
            <div className="lg:col-span-1">
              <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Question Navigator</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNavigationPanel(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {quizState.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    const isCurrent = index === quizState.currentQuestionIndex;
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToQuestion(index)}
                        className={`h-10 w-10 p-0 text-xs font-medium transition-all ${
                          isCurrent 
                            ? 'ring-2 ring-purple-500 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                            : status === 'answered'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                            : status === 'marked'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded border border-green-300 dark:border-green-700"></div>
                    <span className="text-gray-600 dark:text-gray-400">Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded border border-yellow-300 dark:border-yellow-700"></div>
                    <span className="text-gray-600 dark:text-gray-400">Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Unanswered</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div className="font-medium mb-1">Progress Summary:</div>
                    <div>Answered: {Object.keys(userAnswers).length}</div>
                    <div>Marked: {markedForReview.size}</div>
                    <div>Remaining: {quizState.questions.length - Object.keys(userAnswers).length}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Submit Quiz?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your quiz? You have answered {Object.keys(userAnswers).length} out of {quizState.questions.length} questions.
              {Object.keys(userAnswers).length < quizState.questions.length && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> You have {quizState.questions.length - Object.keys(userAnswers).length} unanswered questions.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Continue Quiz
            </Button>
            <Button onClick={handleSubmitQuiz} className="bg-gradient-to-r from-purple-500 to-blue-600">
              <Check className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Time Warning</span>
            </DialogTitle>
            <DialogDescription>
              You have 5 minutes remaining to complete your quiz. Please review your answers and submit before time runs out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTimeWarning(false)}>
              Continue Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 