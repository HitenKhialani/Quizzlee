import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizState, QuizQuestion } from '../types/quiz';
import { loadOSQuestionsByLesson, loadDAQuestionsByLesson, loadSEQuestionsByLesson, loadENTQuestionsByLesson, shuffleQuestions } from '../data/questions';
import { saveQuizResult } from '../lib/progress-utils-api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Target, Brain, Trophy, Bookmark, RotateCcw, Save } from 'lucide-react';

export default function LessonQuiz() {
  const { lessonTitle } = useParams();
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
  const [subject, setSubject] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!lessonTitle) {
        setError('No lesson title provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const decodedLessonTitle = decodeURIComponent(lessonTitle);
        
        // Determine subject based on lesson title
        let questions: QuizQuestion[] = [];
        let detectedSubject = '';
        
        // Check if it's an Entrepreneurship lesson
        if (decodedLessonTitle.includes('Entrepreneurship') || 
            decodedLessonTitle.includes('Business Planning') ||
            decodedLessonTitle.includes('Market Research') ||
            decodedLessonTitle.includes('Finance and Funding')) {
          questions = await loadENTQuestionsByLesson(decodedLessonTitle);
          detectedSubject = 'ENT';
        }
        // Check if it's a Software Engineering lesson
        else if (decodedLessonTitle.includes('Software Engineering') || 
            decodedLessonTitle.includes('Software Development') ||
            decodedLessonTitle.includes('Requirements Engineering') ||
            decodedLessonTitle.includes('Software Design') ||
            decodedLessonTitle.includes('Testing and Quality')) {
          questions = await loadSEQuestionsByLesson(decodedLessonTitle);
          detectedSubject = 'SE';
        }
        // Check if it's a Data Analytics lesson
        else if (decodedLessonTitle.includes('Data Analytics') || 
            decodedLessonTitle.includes('Data Collection') ||
            decodedLessonTitle.includes('Data Cleaning') ||
            decodedLessonTitle.includes('Statistical Analysis') ||
            decodedLessonTitle.includes('Data Visualization')) {
          questions = await loadDAQuestionsByLesson(decodedLessonTitle);
          detectedSubject = 'DA';
        } else {
          // Default to OS for other lessons
          questions = await loadOSQuestionsByLesson(decodedLessonTitle);
          detectedSubject = 'OS';
        }
        
        setSubject(detectedSubject);
        
        if (questions.length === 0) {
          setError('No questions found for this lesson');
        } else {
          setQuizState(prev => ({
            ...prev,
            questions: shuffleQuestions(questions)
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
  }, [lessonTitle]);

  // Timer effect
  useEffect(() => {
    if (!loading && quizState.questions.length > 0 && !quizState.isComplete) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
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
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (quizState.isComplete) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          if (quizState.currentQuestionIndex > 0) {
            handlePrevious();
          }
          break;
        case 'ArrowRight':
          if (quizState.selectedAnswer !== null) {
            handleSaveAndNext();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          const optionIndex = parseInt(event.key) - 1;
          if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
            handleAnswerSelect(currentQuestion.options[optionIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quizState.currentQuestionIndex, quizState.selectedAnswer, quizState.isComplete, currentQuestion]);

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer
    }));
  };

  const handleClearSelection = () => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: null
    }));
    
    // Remove from userAnswers
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[quizState.currentQuestionIndex];
      return newAnswers;
    });
  };

  const handleMarkForReview = () => {
    // Save current answer if selected
    if (quizState.selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [quizState.currentQuestionIndex]: quizState.selectedAnswer
      }));
    }
    
    // Toggle marked for review
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

  const handleSubmitQuiz = async () => {
    // Save current answer if selected
    if (quizState.selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [quizState.currentQuestionIndex]: quizState.selectedAnswer
      }));
    }

    // Calculate final score
    let finalScore = quizState.score;
    if (quizState.selectedAnswer === currentQuestion.answer) {
      finalScore += 1;
    }

    setQuizState(prev => ({
      ...prev,
      score: finalScore,
      isComplete: true
    }));

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
        subjectId: subject === 'DA' ? 'data-analytics' : subject === 'SE' ? 'software-engineering' : subject === 'ENT' ? 'entrepreneurship' : 'operating-systems',
        lessonTitle: decodeURIComponent(lessonTitle || ''),
        score: percentage,
        totalQuestions: quizState.questions.length,
        timeSpent: timeSpent,
        selectedAnswers: userAnswers,
        questions: questionsWithAnswers,
        passed: passed,
        quizType: 'lesson'
      });
    } catch (error) {
      console.error('Failed to save quiz result:', error);
    }

    navigate('/quiz-report', { 
      state: { 
        score: finalScore, 
        total: quizState.questions.length,
        subject: subject,
        lessonTitle: lessonTitle,
        questions: questionsWithAnswers,
        timeSpent: timeSpent
      } 
    });
  };

  const handleQuestionNavigation = (questionIndex: number) => {
    // Save current answer before navigating
    if (quizState.selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [quizState.currentQuestionIndex]: quizState.selectedAnswer
      }));
    }
    
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Quiz</h2>
          <p className="text-gray-600">Preparing your questions...</p>
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
          <Button onClick={() => navigate(`/subjects/${subject === 'DA' ? 'data-analytics' : subject === 'SE' ? 'software-engineering' : subject === 'ENT' ? 'entrepreneurship' : 'operating-systems'}`)}>
            Back to Lessons
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
          <p className="mb-4">No quiz questions found for this lesson.</p>
          <Button onClick={() => navigate(`/subjects/${subject === 'DA' ? 'data-analytics' : subject === 'SE' ? 'software-engineering' : subject === 'ENT' ? 'entrepreneurship' : 'operating-systems'}`)}>
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {decodeURIComponent(lessonTitle || '')} Quiz
              </h1>
              <p className="text-gray-600 mt-2">Test your knowledge and track your progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeSpent)}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{quizState.score}/{quizState.questions.length}</span>
              </Badge>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold mb-4 text-center">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                {quizState.questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  const isCurrent = index === quizState.currentQuestionIndex;
                  
                  let bgColor = 'bg-gray-200 dark:bg-gray-700';
                  let textColor = 'text-gray-700 dark:text-gray-300';
                  
                  if (isCurrent) {
                    bgColor = 'bg-blue-500';
                    textColor = 'text-white';
                  } else if (status === 'answered') {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                  } else if (status === 'marked') {
                    bgColor = 'bg-yellow-500';
                    textColor = 'text-white';
                  } else if (status === 'unanswered') {
                    bgColor = 'bg-red-500';
                    textColor = 'text-white';
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all hover:scale-110 ${bgColor} ${textColor}`}
                      title={`Question ${index + 1} - ${status}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Marked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Question Card */}
          <div className="lg:col-span-3">
            <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Brain className="h-3 w-3" />
                    <span>Question {quizState.currentQuestionIndex + 1}</span>
                  </Badge>
                  {markedForReview.has(quizState.currentQuestionIndex) && (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-yellow-100 text-yellow-800">
                      <Bookmark className="h-3 w-3" />
                      <span>Marked for Review</span>
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
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
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
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearSelection}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear Selection</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMarkForReview}
                  className="flex items-center space-x-2"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Mark for Review</span>
                </Button>

                <Button
                  onClick={handleSaveAndNext}
                  disabled={quizState.selectedAnswer === null}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg ml-auto"
                >
                  <Save className="h-4 w-4" />
                  <span>{quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Submit Quiz' : 'Save & Next'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Keyboard shortcuts: ← → to navigate, 1-4 to select options</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Submit Quiz?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuiz}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Submit Quiz
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}