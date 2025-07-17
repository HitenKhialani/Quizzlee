import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Award, RefreshCw, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

interface QuizReportState {
  score: number;
  total: number;
  subject: string;
  lessonTitle?: string;
  questions?: Array<{
    question: string;
    options: string[];
    answer: string;
    userAnswer?: string;
    subject?: string;
  }>;
  subjectScores?: Record<string, number>;
}

export default function QuizReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, subject, lessonTitle, questions: stateQuestions, subjectScores } = location.state as QuizReportState;
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Fallback: try to get questions from localStorage if not in state
  const getQuestionsFromStorage = () => {
    try {
      const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const latestResult = results[0]; // Get the most recent result
      return latestResult?.questions || [];
    } catch (error) {
      console.error('Error loading questions from storage:', error);
      return [];
    }
  };
  
  const questions = stateQuestions || getQuestionsFromStorage();
  
  const percentage = Math.round((score / total) * 100);
  const isPassed = percentage >= 60;
  const correctAnswers = score;
  const incorrectAnswers = total - score;
  const isFullSyllabus = subject === 'full-syllabus';

  // Calculate subject breakdown for full syllabus quiz
  const getSubjectBreakdown = () => {
    if (!isFullSyllabus || !subjectScores) return null;
    
    const subjectNames = {
      'operating-systems': 'Operating Systems',
      'data-analytics': 'Data Analytics',
      'software-engineering': 'Software Engineering',
      'entrepreneurship': 'Entrepreneurship'
    };
    
    const subjectColors = {
      'operating-systems': 'bg-green-500',
      'data-analytics': 'bg-blue-500',
      'software-engineering': 'bg-purple-500',
      'entrepreneurship': 'bg-orange-500'
    };
    
    return Object.entries(subjectScores).map(([subjectId, subjectScore]) => ({
      name: subjectNames[subjectId as keyof typeof subjectNames] || subjectId,
      score: subjectScore,
      percentage: Math.round((subjectScore / 25) * 100), // 25 questions per subject
      color: subjectColors[subjectId as keyof typeof subjectColors] || 'bg-gray-500'
    }));
  };

  const subjectBreakdown = getSubjectBreakdown();

  // Debug logging
  console.log('QuizReport Debug:', {
    questions: questions,
    questionsLength: questions?.length,
    subject: subject,
    isFullSyllabus: isFullSyllabus
  });

  // Calculate performance metrics for charts
  const getPerformanceMetrics = () => {
    const correctPercentage = Math.round((correctAnswers / total) * 100);
    const incorrectPercentage = Math.round((incorrectAnswers / total) * 100);
    
    return {
      correct: correctPercentage,
      incorrect: incorrectPercentage,
      accuracy: correctPercentage,
      efficiency: Math.round((correctAnswers / total) * 100)
    };
  };

  const performanceMetrics = getPerformanceMetrics();

  const handleExportToPDF = () => {
    // Debug logging
    console.log('PDF Export Debug:', {
      score,
      total,
      percentage,
      correctAnswers,
      incorrectAnswers,
      questions: questions?.length,
      lessonTitle,
      subject
    });

    // Create a simple, reliable PDF using jsPDF
    try {
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica');
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246); // Blue
      doc.text('Quizzle - Quiz Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const title = lessonTitle ? decodeURIComponent(lessonTitle) : 'Quiz Report';
      doc.text(title, 105, 30, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 37, { align: 'center' });
      
      // Score Section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Quiz Results', 20, 55);
      
      // Score details
      doc.setFontSize(14);
      doc.text(`Final Score: ${percentage}%`, 20, 70);
      doc.text(`Correct Answers: ${correctAnswers}/${total}`, 20, 80);
      doc.text(`Incorrect Answers: ${incorrectAnswers}/${total}`, 20, 90);
      
      // Pass/Fail status
      doc.setFontSize(16);
      if (isPassed) {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(isPassed ? 'PASSED' : 'FAILED', 105, 105, { align: 'center' });
      
      // Performance Analysis
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Performance Analysis', 20, 125);
      
      doc.setFontSize(12);
      doc.text(`Overall Accuracy: ${performanceMetrics.accuracy}%`, 20, 135);
      doc.text(`Correct Percentage: ${performanceMetrics.correct}%`, 20, 142);
      doc.text(`Incorrect Percentage: ${performanceMetrics.incorrect}%`, 20, 149);
      
      // Subject breakdown for full syllabus
      if (isFullSyllabus && subjectBreakdown) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Subject Breakdown', 20, 165);
        
        let yPos = 175;
        subjectBreakdown.forEach(subject => {
          doc.setFontSize(12);
          doc.text(`${subject.name}: ${subject.score}/25 (${subject.percentage}%)`, 20, yPos);
          yPos += 8;
        });
      }
      
      // Questions Review
      if (questions && questions.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Question Review (${questions.length} questions)`, 20, 20);
        
        let yPosition = 35;
        questions.forEach((question, index) => {
          const isCorrect = question.userAnswer === question.answer;
          
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Question ${index + 1}`, 20, yPosition);
          
          // Status
          if (isCorrect) {
            doc.setTextColor(16, 185, 129);
          } else {
            doc.setTextColor(239, 68, 68);
          }
          doc.text(isCorrect ? '✓ Correct' : '✗ Incorrect', 180, yPosition);
          
          yPosition += 8;
          
          // Subject tag for full syllabus
          if (isFullSyllabus && question.subject) {
            const subjectName = question.subject === 'operating-systems' ? 'OS' :
              question.subject === 'data-analytics' ? 'DA' :
              question.subject === 'software-engineering' ? 'SE' :
              question.subject === 'entrepreneurship' ? 'ENT' : question.subject;
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`[${subjectName}]`, 20, yPosition);
            yPosition += 5;
          }
          
          // Question text
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const questionLines = doc.splitTextToSize(question.question, 170);
          doc.text(questionLines, 20, yPosition);
          yPosition += (questionLines.length * 5) + 5;
          
          // Options
          question.options.forEach((option, optIndex) => {
            let prefix = '•';
            
            doc.setFontSize(10);
            if (option === question.answer) {
              doc.setTextColor(16, 185, 129); // Green for correct
              prefix = '✓';
            } else if (option === question.userAnswer && !isCorrect) {
              doc.setTextColor(239, 68, 68); // Red for incorrect user answer
              prefix = '✗';
            } else {
              doc.setTextColor(100, 100, 100); // Gray for normal
            }
            doc.text(`${prefix} ${String.fromCharCode(65 + optIndex)}. ${option}`, 25, yPosition);
            yPosition += 5;
          });
          
          // Explanation for incorrect answers
          if (!isCorrect) {
            yPosition += 3;
            doc.setFontSize(10);
            doc.setTextColor(245, 158, 11); // Orange
            doc.text(`Your Answer: ${question.userAnswer || 'Not answered'}`, 20, yPosition);
            yPosition += 5;
            doc.text(`Correct Answer: ${question.answer}`, 20, yPosition);
            yPosition += 8;
          }
          
          yPosition += 10; // Space between questions
        });
      } else {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('No Questions Available', 20, 20);
        doc.text('Question data is not available for this report.', 20, 30);
      }
      
      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Generated by Quizzle - Your Learning Platform', 105, 280, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }
      
      // Save the PDF
      const filename = `quizzle_${subject}_${lessonTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'report'}.pdf`;
      doc.save(filename);
      
      console.log('PDF generated successfully with jsPDF');
      
    } catch (error) {
      console.error('jsPDF failed:', error);
      
      // Fallback to html2pdf method
      const pdfHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Quizzle Quiz Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white; 
              color: black;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #3b82f6; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
            }
            .header h1 { 
              color: #3b82f6; 
              margin: 0 0 10px 0; 
              font-size: 24px;
            }
            .score-section { 
              background: #f8fafc; 
              padding: 15px; 
              border: 1px solid #e5e7eb;
              margin-bottom: 20px;
              text-align: center;
            }
            .score-grid { 
              display: table; 
              width: 100%; 
              margin: 15px 0;
            }
            .score-item { 
              display: table-cell; 
              text-align: center; 
              padding: 8px;
              width: 25%;
            }
            .score-value { 
              font-size: 20px; 
              font-weight: bold; 
              display: block;
            }
            .score-label { 
              font-size: 12px; 
              color: #666;
              display: block;
            }
            .status-badge { 
              display: inline-block; 
              padding: 8px 16px; 
              border-radius: 15px; 
              font-weight: bold; 
              font-size: 14px;
              margin-top: 8px;
            }
            .status-passed { 
              background: #10b981; 
              color: white;
            }
            .status-failed { 
              background: #ef4444; 
              color: white;
            }
            .section { 
              margin-bottom: 20px;
            }
            .section h2 { 
              color: #3b82f6; 
              border-bottom: 1px solid #e5e7eb; 
              padding-bottom: 8px;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .question-item { 
              background: #f8fafc; 
              padding: 15px; 
              border: 1px solid #e5e7eb;
              margin-bottom: 15px;
            }
            .question-header { 
              display: table; 
              width: 100%;
              margin-bottom: 10px;
            }
            .question-number { 
              display: table-cell;
              font-weight: bold; 
              font-size: 16px; 
              color: #374151;
              width: 70%;
            }
            .question-status { 
              display: table-cell;
              text-align: right;
              padding: 3px 6px; 
              border-radius: 3px; 
              font-size: 11px; 
              font-weight: bold;
              width: 30%;
            }
            .status-correct { 
              background: #10b981; 
              color: white;
            }
            .status-incorrect { 
              background: #ef4444; 
              color: white;
            }
            .question-text { 
              margin-bottom: 10px; 
              font-size: 14px;
              font-weight: bold;
            }
            .option { 
              padding: 8px 10px; 
              margin-bottom: 6px; 
              border: 1px solid #d1d5db;
              border-radius: 3px; 
              font-size: 12px;
              background: #f3f4f6;
            }
            .option-correct { 
              background: #d1fae5; 
              border: 2px solid #10b981;
              font-weight: bold;
            }
            .option-incorrect { 
              background: #fee2e2; 
              border: 2px solid #ef4444;
              font-weight: bold;
            }
            .explanation { 
              background: #fef3c7; 
              padding: 10px; 
              border: 1px solid #f59e0b;
              border-radius: 3px; 
              font-size: 12px;
              margin-top: 8px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 15px; 
              border-top: 1px solid #e5e7eb; 
              color: #666;
              font-size: 12px;
            }
            .subject-tag {
              background: #e5e7eb; 
              padding: 3px 6px; 
              border-radius: 3px; 
              font-size: 11px;
              display: inline-block;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quizzle - Quiz Report</h1>
            <p><strong>${decodeURIComponent(lessonTitle || 'Quiz Report')}</strong></p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="score-section">
            <h2>Quiz Results</h2>
            <div class="score-grid">
              <div class="score-item">
                <span class="score-value" style="color: #3b82f6;">${percentage}%</span>
                <span class="score-label">Final Score</span>
              </div>
              <div class="score-item">
                <span class="score-value" style="color: #10b981;">${correctAnswers}</span>
                <span class="score-label">Correct</span>
              </div>
              <div class="score-item">
                <span class="score-value" style="color: #ef4444;">${incorrectAnswers}</span>
                <span class="score-label">Incorrect</span>
              </div>
              <div class="score-item">
                <span class="score-value" style="color: #3b82f6;">${total}</span>
                <span class="score-label">Total Questions</span>
              </div>
            </div>
            <div class="status-badge ${isPassed ? 'status-passed' : 'status-failed'}">
              ${isPassed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          ${questions && questions.length > 0 ? `
          <div class="section">
            <h2>Question Review (${questions.length} questions)</h2>
            ${questions.map((question, index) => {
              const isCorrect = question.userAnswer === question.answer;
              return `
                <div class="question-item">
                  <div class="question-header">
                    <div class="question-number">Question ${index + 1}</div>
                    <div class="question-status ${isCorrect ? 'status-correct' : 'status-incorrect'}">
                      ${isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  ${isFullSyllabus && question.subject ? `
                    <div class="subject-tag">
                      ${question.subject === 'operating-systems' ? 'Operating Systems' :
                        question.subject === 'data-analytics' ? 'Data Analytics' :
                        question.subject === 'software-engineering' ? 'Software Engineering' :
                        question.subject === 'entrepreneurship' ? 'Entrepreneurship' : question.subject}
                    </div>
                  ` : ''}
                  <div class="question-text">${question.question}</div>
                  <div class="options">
                    ${question.options.map(option => {
                      let optionClass = 'option';
                      if (option === question.answer) {
                        optionClass = 'option option-correct';
                      } else if (option === question.userAnswer && !isCorrect) {
                        optionClass = 'option option-incorrect';
                      }
                      return `<div class="${optionClass}">${option}</div>`;
                    }).join('')}
                  </div>
                  ${!isCorrect ? `
                    <div class="explanation">
                      <strong>Your Answer:</strong> ${question.userAnswer || 'Not answered'}<br>
                      <strong>Correct Answer:</strong> ${question.answer}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
          ` : '<div class="section"><h2>No Questions Available</h2><p>Question data is not available for this report.</p></div>'}

          <div class="footer">
            <p>Generated by Quizzle - Your Learning Platform</p>
          </div>
        </body>
        </html>
      `;

      const opt = {
        margin: 0.5,
        filename: `quizzle_${subject}_${lessonTitle?.replace(/\s+/g, '_') || 'report'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = pdfHTML;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);

      // Wait for DOM to render before generating PDF
      setTimeout(() => {
        html2pdf().set(opt).from(tempContainer).save().then(() => {
          document.body.removeChild(tempContainer);
        });
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => isFullSyllabus ? navigate('/subjects') : navigate(`/subjects/${subject}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isFullSyllabus ? 'Back to Subjects' : 'Back to Lessons'}
            </Button>
            
            <Button onClick={handleExportToPDF} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Full Report as PDF
            </Button>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-xl text-muted-foreground">{decodeURIComponent(lessonTitle || '')}</p>
          </div>
        </div>

        {/* Report Content for PDF Export */}
        <div ref={reportRef} className="max-w-6xl mx-auto">
          {/* PDF Header */}
          <div className="pdf-header mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Quizzle - Quiz Report</h1>
            <p className="text-lg text-muted-foreground mb-4">{decodeURIComponent(lessonTitle || '')}</p>
            <div className="text-sm text-muted-foreground">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Score Overview */}
          <Card className="quiz-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                {isPassed ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
                <span className="text-2xl">
                  {isPassed ? 'Congratulations!' : 'Better luck next time!'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {incorrectAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
              </div>

              <Progress value={percentage} className="mb-4" />
              
              <div className="text-center">
                <Badge 
                  variant={isPassed ? 'default' : 'destructive'}
                  className="text-base px-4 py-2"
                >
                  {isPassed ? 'PASSED' : 'FAILED'} 
                  {isPassed && <Award className="h-4 w-4 ml-2" />}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Graphical Analysis */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Performance Chart */}
            <Card className="quiz-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Correct Answers</span>
                    <span className="text-sm text-green-600 font-semibold">{performanceMetrics.correct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${performanceMetrics.correct}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Incorrect Answers</span>
                    <span className="text-sm text-red-600 font-semibold">{performanceMetrics.incorrect}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${performanceMetrics.incorrect}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Chart */}
            <Card className="quiz-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Accuracy Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - performanceMetrics.accuracy / 100)}`}
                        className="text-green-500 transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{performanceMetrics.accuracy}%</div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card className="quiz-card mb-8">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Score Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Correct Answers</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        {correctAnswers} ({Math.round((correctAnswers / total) * 100)}%)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Incorrect Answers</span>
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                        {incorrectAnswers} ({Math.round((incorrectAnswers / total) * 100)}%)
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Performance Level</h3>
                  <div className="space-y-2">
                    {percentage >= 90 && (
                      <Alert className="border-green-500/20 bg-green-500/10">
                        <Award className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-600">
                          Excellent! You have mastered this topic.
                        </AlertDescription>
                      </Alert>
                    )}
                    {percentage >= 80 && percentage < 90 && (
                      <Alert className="border-blue-500/20 bg-blue-500/10">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-blue-600">
                          Great job! You have a solid understanding.
                        </AlertDescription>
                      </Alert>
                    )}
                    {percentage >= 60 && percentage < 80 && (
                      <Alert className="border-yellow-500/20 bg-yellow-500/10">
                        <CheckCircle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-yellow-600">
                          Good work! You passed but there's room for improvement.
                        </AlertDescription>
                      </Alert>
                    )}
                    {percentage < 60 && (
                      <Alert className="border-red-500/20 bg-red-500/10">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-600">
                          Keep practicing! Review the material and try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown for Full Syllabus Quiz */}
          {isFullSyllabus && subjectBreakdown && (
            <Card className="quiz-card mb-8">
              <CardHeader>
                <CardTitle>Subject Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {subjectBreakdown.map((subject, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <Badge className={`${subject.color} text-white`}>
                          {subject.score}/25
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score</span>
                          <span>{subject.percentage}%</span>
                        </div>
                        <Progress value={subject.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {subject.score} correct out of 25 questions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collapsible Question Review */}
          <Card className="quiz-card mb-8">
            <Collapsible open={isQuestionsExpanded} onOpenChange={setIsQuestionsExpanded}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span>Question Review {questions && questions.length > 0 ? `(${questions.length} questions)` : ''}</span>
                    {isQuestionsExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {questions && questions.length > 0 ? (
                    <div className="space-y-6">
                      {questions.map((question, index) => {
                        const isCorrect = question.userAnswer === question.answer;
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  Question {index + 1}
                                </h3>
                                {isFullSyllabus && question.subject && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {question.subject === 'operating-systems' ? 'Operating Systems' :
                                     question.subject === 'data-analytics' ? 'Data Analytics' :
                                     question.subject === 'software-engineering' ? 'Software Engineering' :
                                     question.subject === 'entrepreneurship' ? 'Entrepreneurship' : question.subject}
                                  </Badge>
                                )}
                              </div>
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 mt-1" />
                              )}
                            </div>
                            
                            <p className="mb-4">{question.question}</p>
                            
                            <div className="space-y-2 mb-4">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex} 
                                  className={`p-3 rounded-lg border ${
                                    option === question.answer 
                                      ? 'bg-green-50 border-green-200 text-green-800' 
                                      : option === question.userAnswer && !isCorrect
                                      ? 'bg-red-50 border-red-200 text-red-800'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {option === question.answer && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    {option === question.userAnswer && !isCorrect && (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span>{option}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {!isCorrect && (
                              <Alert>
                                <AlertDescription>
                                  <strong>Your Answer:</strong> {question.userAnswer || 'Not answered'}
                                  <br />
                                  <strong>Correct Answer:</strong> {question.answer}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No question data available for review.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This might happen if you navigated back to this page. Try taking the quiz again.
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* PDF Footer */}
          <div className="pdf-footer mt-8 text-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Generated by Quizzle - Your Learning Platform
            </p>
          </div>
        </div>

        {/* Action Buttons (Outside PDF content) */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          {isFullSyllabus ? (
            <>
              <Button variant="outline" onClick={() => navigate('/quiz/full-syllabus')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Full Syllabus Quiz
              </Button>
              
              <Button onClick={() => navigate('/subjects')}>
                View All Subjects
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="secondary" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Lesson
              </Button>
              
              <Button onClick={() => navigate(`/subjects/${subject}`)}>
                Continue to Next Lesson
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="secondary" onClick={() => navigate('/subjects')}>
                View All Lessons
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}