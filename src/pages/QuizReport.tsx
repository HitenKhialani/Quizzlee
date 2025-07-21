import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Clock, Award, RefreshCw, ArrowRight, ArrowLeft, 
  ChevronDown, ChevronUp, BarChart3, TrendingUp, PieChart, Download, 
  Target, Brain, Trophy, Star, Calendar, User, BookOpen, FileText,
  Zap, Activity, Medal
} from 'lucide-react';
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
  timeSpent?: number;
}

export default function QuizReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, subject, lessonTitle, questions: stateQuestions, subjectScores, timeSpent } = location.state as QuizReportState;
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

  // Get grade and performance level
  const getGradeInfo = () => {
    if (percentage >= 90) return { grade: 'A+', level: 'Excellent', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50' };
    if (percentage >= 80) return { grade: 'A', level: 'Very Good', color: 'from-green-500 to-emerald-600', textColor: 'text-green-600', bgColor: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', level: 'Good', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'C', level: 'Satisfactory', color: 'from-yellow-500 to-orange-600', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { grade: 'F', level: 'Needs Improvement', color: 'from-red-500 to-rose-600', textColor: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const gradeInfo = getGradeInfo();

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
      'operating-systems': { bg: 'bg-gradient-to-br from-green-500 to-emerald-600', text: 'text-green-600', light: 'bg-green-50' },
      'data-analytics': { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', text: 'text-blue-600', light: 'bg-blue-50' },
      'software-engineering': { bg: 'bg-gradient-to-br from-purple-500 to-violet-600', text: 'text-purple-600', light: 'bg-purple-50' },
      'entrepreneurship': { bg: 'bg-gradient-to-br from-orange-500 to-amber-600', text: 'text-orange-600', light: 'bg-orange-50' }
    };
    
    return Object.entries(subjectScores).map(([subjectId, subjectScore]) => ({
      name: subjectNames[subjectId as keyof typeof subjectNames] || subjectId,
      score: subjectScore,
      percentage: Math.round((subjectScore / 25) * 100), // 25 questions per subject
      colors: subjectColors[subjectId as keyof typeof subjectColors] || { bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-50' }
    }));
  };

  const subjectBreakdown = getSubjectBreakdown();

  // Calculate performance metrics for charts
  const getPerformanceMetrics = () => {
    const correctPercentage = Math.round((correctAnswers / total) * 100);
    const incorrectPercentage = Math.round((incorrectAnswers / total) * 100);
    
    return {
      correct: correctPercentage,
      incorrect: incorrectPercentage,
      accuracy: correctPercentage,
      efficiency: correctPercentage
    };
  };

  const performanceMetrics = getPerformanceMetrics();

  // Enhanced PDF Export with professional styling
  const handleExportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Helper function to add a new page with header
      const addPageWithHeader = () => {
        doc.addPage();
        addPageHeader();
      };

      // Helper function to add page header
      const addPageHeader = () => {
        // Header background
        doc.setFillColor(59, 130, 246); // Blue gradient start
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Quizzle Logo/Icon area - Custom Graduation Cap
        doc.setFillColor(255, 255, 255, 0.9);
        doc.circle(25, 17.5, 8, 'F');
        
        // Draw custom graduation cap icon
        const capCenterX = 25;
        const capCenterY = 17.5;
        
        // Graduation cap base (mortarboard)
        doc.setFillColor(59, 130, 246);
        doc.rect(capCenterX - 4, capCenterY - 2, 8, 1.5, 'F');
        
        // Cap top square
        doc.setFillColor(59, 130, 246);
        doc.rect(capCenterX - 3, capCenterY - 4, 6, 2, 'F');
        
        // Tassel
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.line(capCenterX + 3, capCenterY - 3, capCenterX + 5, capCenterY - 1);
        doc.line(capCenterX + 5, capCenterY - 1, capCenterX + 5, capCenterY + 1);
        
        // Small tassel end
        doc.setFillColor(59, 130, 246);
        doc.circle(capCenterX + 5, capCenterY + 1, 0.5, 'F');
        
        // Header text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('QUIZ PERFORMANCE REPORT', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(decodeURIComponent(lessonTitle || 'Assessment Report'), pageWidth / 2, 23, { align: 'center' });
        doc.text(`Generated by Quizzle Learning Platform on ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      };

      // Helper function to draw a progress bar
      const drawProgressBar = (x, y, width, height, percentage, color) => {
        // Background
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x, y, width, height, 2, 2, 'F');
        
        // Progress fill
        const fillWidth = (width * percentage) / 100;
        if (fillWidth > 0) {
          doc.setFillColor(color[0], color[1], color[2]);
          doc.roundedRect(x, y, fillWidth, height, 2, 2, 'F');
        }
      };

      // Helper function to draw a circular progress
      const drawCircularProgress = (x, y, radius, percentage, color, thickness = 4) => {
        const centerX = x + radius;
        const centerY = y + radius;
        
        // Background circle
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(thickness);
        doc.circle(centerX, centerY, radius, 'S');
        
        // Progress arc (simplified as segments)
        if (percentage > 0) {
          doc.setDrawColor(color[0], color[1], color[2]);
          doc.setLineWidth(thickness);
          
          // Draw arc segments to simulate progress
          const segments = Math.floor((percentage / 100) * 16); // 16 segments for smooth appearance
          for (let i = 0; i < segments; i++) {
            const angle = (i / 16) * 2 * Math.PI - Math.PI / 2;
            const nextAngle = ((i + 1) / 16) * 2 * Math.PI - Math.PI / 2;
            const startX = centerX + radius * Math.cos(angle);
            const startY = centerY + radius * Math.sin(angle);
            const endX = centerX + radius * Math.cos(nextAngle);
            const endY = centerY + radius * Math.sin(nextAngle);
            doc.line(startX, startY, endX, endY);
          }
        }
      };

      // Helper function to create colored box
      const drawColoredBox = (x, y, width, height, color, text, textColor = [255, 255, 255]) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(x, y, width, height, 3, 3, 'F');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(text, x + width/2, y + height/2 + 2, { align: 'center' });
      };

      // Add first page header
      addPageHeader();

      // Score Hero Section
      let yPos = 50;
      
      // Large score circle
      const scoreCircleX = pageWidth / 2 - 25;
      const scoreCircleY = yPos;
      
      // Outer gradient circle (simulated with multiple circles)
      const colors = gradeInfo.color === 'from-emerald-500 to-green-600' ? [16, 185, 129] :
                   gradeInfo.color === 'from-green-500 to-emerald-600' ? [34, 197, 94] :
                   gradeInfo.color === 'from-blue-500 to-indigo-600' ? [59, 130, 246] :
                   gradeInfo.color === 'from-yellow-500 to-orange-600' ? [245, 158, 11] :
                   [239, 68, 68];
      
      doc.setFillColor(colors[0], colors[1], colors[2]);
      doc.circle(scoreCircleX + 25, scoreCircleY + 25, 25, 'F');
      
      // Inner white circle
      doc.setFillColor(255, 255, 255);
      doc.circle(scoreCircleX + 25, scoreCircleY + 25, 20, 'F');
      
      // Score text
      doc.setTextColor(colors[0], colors[1], colors[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(`${percentage}%`, scoreCircleX + 25, scoreCircleY + 22, { align: 'center' });
      doc.setFontSize(14);
      doc.text(gradeInfo.grade, scoreCircleX + 25, scoreCircleY + 32, { align: 'center' });

      yPos += 60;

      // Pass/Fail Badge
      const badgeWidth = 60;
      const badgeHeight = 12;
      const badgeX = pageWidth / 2 - badgeWidth / 2;
      
      drawColoredBox(badgeX, yPos, badgeWidth, badgeHeight, 
                    isPassed ? [16, 185, 129] : [239, 68, 68], 
                    isPassed ? 'PASSED' : 'FAILED');

      yPos += 25;

      // Performance Level
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Performance Level: ${gradeInfo.level}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 20;

      // Key Metrics Section
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Performance Summary', 20, yPos);

      yPos += 15;

      // Metrics grid
      const metrics = [
        { label: 'Correct', value: correctAnswers, color: [16, 185, 129], icon: 'C' },
        { label: 'Incorrect', value: incorrectAnswers, color: [239, 68, 68], icon: 'X' },
        { label: 'Total', value: total, color: [59, 130, 246], icon: 'T' },
        { label: 'Time', value: timeMetrics.totalTime, color: [147, 51, 234], icon: 'H' }
      ];

      const boxWidth = 35;
      const boxHeight = 25;
      const spacing = 10;
      const startX = 20;

      metrics.forEach((metric, index) => {
        const x = startX + (index * (boxWidth + spacing));
        
        // Metric box
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 3, 3, 'F');
        doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setLineWidth(2);
        doc.roundedRect(x, yPos, boxWidth, boxHeight, 3, 3, 'S');
        
        // Icon
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(metric.icon, x + boxWidth/2, yPos + 8, { align: 'center' });
        
        // Value
        doc.setFontSize(12);
        doc.text(String(metric.value), x + boxWidth/2, yPos + 18, { align: 'center' });
        
        // Label
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(metric.label, x + boxWidth/2, yPos + 32, { align: 'center' });
      });

      yPos += 50;

      // Enhanced Performance Analytics Section
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Performance Analytics', 20, yPos);

      yPos += 15;

      // Left Section - Enhanced Accuracy Overview (moved closer to heading)
      const leftSectionX = 25;
      const rightSectionX = pageWidth / 2 + 10;

      // Accuracy Overview Card Background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(leftSectionX, yPos, 70, 55, 5, 5, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.roundedRect(leftSectionX, yPos, 70, 55, 5, 5, 'S');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text('Accuracy Overview', leftSectionX + 35, yPos + 8, { align: 'center' });

      // Enhanced circular progress with multiple rings
      const circleX = leftSectionX + 35;
      const circleY = yPos + 30;
      
      // Outer ring (background)
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(6);
      doc.circle(circleX, circleY, 15, 'S');
      
      // Progress ring with gradient effect (simulate with multiple circles)
      doc.setDrawColor(colors[0], colors[1], colors[2]);
      doc.setLineWidth(6);
      const segments = Math.floor((performanceMetrics.accuracy / 100) * 24);
      for (let i = 0; i < segments; i++) {
        const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
        const nextAngle = ((i + 1) / 24) * 2 * Math.PI - Math.PI / 2;
        const startX = circleX + 15 * Math.cos(angle);
        const startY = circleY + 15 * Math.sin(angle);
        const endX = circleX + 15 * Math.cos(nextAngle);
        const endY = circleY + 15 * Math.sin(nextAngle);
        doc.line(startX, startY, endX, endY);
      }
      
      // Inner accent circle
      doc.setFillColor(colors[0], colors[1], colors[2], 0.1);
      doc.circle(circleX, circleY, 12, 'F');
      
      // Center percentage
      doc.setTextColor(colors[0], colors[1], colors[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${performanceMetrics.accuracy}%`, circleX, circleY + 2, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Accuracy', circleX, circleY + 8, { align: 'center' });

      // Right Section - Enhanced Performance Breakdown
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(rightSectionX, yPos, 85, 55, 5, 5, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.roundedRect(rightSectionX, yPos, 85, 55, 5, 5, 'S');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      doc.text('Performance Breakdown', rightSectionX + 42.5, yPos + 8, { align: 'center' });

      // Enhanced progress bars with shadows
      const barY = yPos + 18;
      
      // Correct answers section
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Correct Answers', rightSectionX + 5, barY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`${performanceMetrics.correct}%`, rightSectionX + 75, barY + 5);
      
      // Progress bar with shadow effect
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(rightSectionX + 5, barY + 7, 70, 6, 3, 3, 'F');
      
      const correctBarWidth = (70 * performanceMetrics.correct) / 100;
      if (correctBarWidth > 0) {
        // Gradient effect with multiple green shades
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(rightSectionX + 5, barY + 7, correctBarWidth, 6, 3, 3, 'F');
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(rightSectionX + 5, barY + 8, correctBarWidth, 4, 2, 2, 'F');
      }

      // Incorrect answers section
      const incorrectBarY = barY + 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Incorrect Answers', rightSectionX + 5, incorrectBarY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(`${performanceMetrics.incorrect}%`, rightSectionX + 75, incorrectBarY + 5);
      
      // Progress bar with shadow effect
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(rightSectionX + 5, incorrectBarY + 7, 70, 6, 3, 3, 'F');
      
      const incorrectBarWidth = (70 * performanceMetrics.incorrect) / 100;
      if (incorrectBarWidth > 0) {
        // Gradient effect with multiple red shades
        doc.setFillColor(239, 68, 68);
        doc.roundedRect(rightSectionX + 5, incorrectBarY + 7, incorrectBarWidth, 6, 3, 3, 'F');
        doc.setFillColor(220, 38, 38);
        doc.roundedRect(rightSectionX + 5, incorrectBarY + 8, incorrectBarWidth, 4, 2, 2, 'F');
      }

      yPos += 70;

      // Performance Insights
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Performance Insights', 20, yPos);

      yPos += 15;

      // Key metrics table
      const tableData = [
        ['Success Rate', `${correctAnswers}/${total} (${Math.round((correctAnswers / total) * 100)}%)`],
        ['Time Efficiency', `${timeMetrics.avgPerQuestion} per question`],
        ['Overall Grade', `${gradeInfo.grade} - ${gradeInfo.level}`],
        ['Recommendation', percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job, keep practicing!' : 'Review material and retry']
      ];

      tableData.forEach((row, index) => {
        const rowY = yPos + (index * 12);
        
        // Row background (alternating)
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, rowY - 3, pageWidth - 40, 10, 'F');
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(row[0], 25, rowY + 3);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(row[1], 85, rowY + 3);
      });

      yPos += 60;

      // Subject Breakdown for Full Syllabus
      if (isFullSyllabus && subjectBreakdown) {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          addPageWithHeader();
          yPos = 50;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Subject Performance Breakdown', 20, yPos);

        yPos += 15;

        subjectBreakdown.forEach((subject, index) => {
          if (yPos > pageHeight - 40) {
            addPageWithHeader();
            yPos = 50;
          }

          const subjectColors = {
            'Operating Systems': [16, 185, 129],
            'Data Analytics': [59, 130, 246],
            'Software Engineering': [147, 51, 234],
            'Entrepreneurship': [245, 158, 11]
          };

          const color = subjectColors[subject.name] || [100, 100, 100];

          // Subject header
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(subject.name, 20, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(`${subject.score}/25 (${subject.percentage}%)`, pageWidth - 60, yPos);

          yPos += 8;

          // Progress bar
          drawProgressBar(20, yPos, pageWidth - 40, 6, subject.percentage, color);

          yPos += 15;
        });

        yPos += 10;
      }

      // Questions Review Section (if we have questions)
      if (questions && questions.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
          addPageWithHeader();
          yPos = 50;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(`Question Review (${questions.length} questions)`, 20, yPos);

        yPos += 20;

        questions.forEach((question, index) => {
          // Check if we need a new page for this question
          if (yPos > pageHeight - 80) {
            addPageWithHeader();
            yPos = 50;
          }

          const isCorrect = question.userAnswer === question.answer;

          // Question header
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Question ${index + 1}`, 20, yPos);

          // Status indicator
          const statusColor = isCorrect ? [16, 185, 129] : [239, 68, 68];
          const statusText = isCorrect ? 'CORRECT' : 'INCORRECT';
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          doc.text(statusText, pageWidth - 40, yPos);

          yPos += 8;

          // Subject tag for full syllabus
          if (isFullSyllabus && question.subject) {
            const subjectName = question.subject === 'operating-systems' ? 'OS' :
              question.subject === 'data-analytics' ? 'DA' :
              question.subject === 'software-engineering' ? 'SE' :
              question.subject === 'entrepreneurship' ? 'ENT' : question.subject;
            
            doc.setFillColor(100, 100, 100);
            doc.rect(20, yPos - 2, 15, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(subjectName, 27.5, yPos + 1, { align: 'center' });
            yPos += 10;
          }

          // Question text
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          const questionLines = doc.splitTextToSize(question.question, pageWidth - 40);
          doc.text(questionLines, 20, yPos);
          yPos += (questionLines.length * 4) + 8;

          // Options
          question.options.forEach((option, optIndex) => {
            if (yPos > pageHeight - 20) {
              addPageWithHeader();
              yPos = 50;
            }

            const isAnswer = option === question.answer;
            const isUserAnswer = option === question.userAnswer;
            
            let optionColor = [100, 100, 100]; // Default gray
            let prefix = String.fromCharCode(65 + optIndex) + '.';
            
            if (isAnswer) {
              optionColor = [16, 185, 129]; // Green for correct
              prefix = '[CORRECT] ' + prefix;
            } else if (isUserAnswer && !isCorrect) {
              optionColor = [239, 68, 68]; // Red for wrong user answer
              prefix = '[YOUR ANSWER] ' + prefix;
            }

            doc.setFont('helvetica', isAnswer || isUserAnswer ? 'bold' : 'normal');
            doc.setFontSize(9);
            doc.setTextColor(optionColor[0], optionColor[1], optionColor[2]);
            
            const optionText = `${prefix} ${option}`;
            // Increased width for better text fitting
            const optionLines = doc.splitTextToSize(optionText, pageWidth - 60);
            doc.text(optionLines, 30, yPos);
            // Better spacing for multi-line options
            yPos += (optionLines.length * 4.5) + 3;
          });

          // Explanation for incorrect answers
          if (!isCorrect) {
            yPos += 3;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(245, 158, 11); // Orange
            doc.text(`Your Answer: ${question.userAnswer || 'Not answered'}`, 25, yPos);
            yPos += 4;
            doc.text(`Correct Answer: ${question.answer}`, 25, yPos);
            yPos += 6;
          }

          yPos += 10; // Space between questions
        });
      }

      // Chapter-wise Analysis Section (PDF)
      if (chapterAnalysis && chapterAnalysis.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
          addPageWithHeader();
          yPos = 50;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Chapter-wise Performance Analysis', 20, yPos);

        yPos += 15;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Detailed breakdown of your performance across different topics', 20, yPos);

        yPos += 20;

        // Performance summary table
        chapterAnalysis.forEach((chapter, index) => {
          // Check if we need a new page
          if (yPos > pageHeight - 60) {
            addPageWithHeader();
            yPos = 50;
          }

          // Chapter card background
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(20, yPos, pageWidth - 40, 45, 5, 5, 'F');
          
          // Performance color indicator
          const indicatorColor = chapter.accuracy >= 80 ? [16, 185, 129] :
                                chapter.accuracy >= 70 ? [59, 130, 246] :
                                chapter.accuracy >= 60 ? [245, 158, 11] : [239, 68, 68];
          
          doc.setFillColor(indicatorColor[0], indicatorColor[1], indicatorColor[2]);
          doc.rect(20, yPos, 5, 45, 'F');

          // Chapter title
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(chapter.chapter, 30, yPos + 8);

          // Accuracy percentage
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(indicatorColor[0], indicatorColor[1], indicatorColor[2]);
          doc.text(`${chapter.accuracy}%`, pageWidth - 50, yPos + 12, { align: 'center' });

          // Performance level
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text('Accuracy', pageWidth - 50, yPos + 18, { align: 'center' });

          // Stats
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`Performance: ${chapter.performance}`, 30, yPos + 18);
          doc.text(`Correct: ${chapter.correct}/${chapter.total}`, 30, yPos + 25);

          // Progress bar
          const barWidth = 80;
          const barHeight = 4;
          const barX = 30;
          const barY = yPos + 30;

          // Background bar
          doc.setFillColor(220, 220, 220);
          doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

          // Progress fill
          const fillWidth = (barWidth * chapter.accuracy) / 100;
          if (fillWidth > 0) {
            doc.setFillColor(indicatorColor[0], indicatorColor[1], indicatorColor[2]);
            doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');
          }

          // Recommendation
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(75, 85, 99);
          const recommendationLines = doc.splitTextToSize(`Recommendation: ${chapter.recommendation}`, pageWidth - 120);
          doc.text(recommendationLines, 30, yPos + 38);

          yPos += 55;
        });

        yPos += 15;

        // Study recommendations summary
        if (yPos > pageHeight - 80) {
          addPageWithHeader();
          yPos = 50;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Study Recommendations', 20, yPos);

        yPos += 15;

        // Strengths
        const strengths = chapterAnalysis.filter(ch => ch.accuracy >= 80);
        if (strengths.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(16, 185, 129);
          doc.text('Strengths (80%+ accuracy):', 20, yPos);
          yPos += 8;

          strengths.forEach(chapter => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`• ${chapter.chapter} (${chapter.accuracy}%)`, 25, yPos);
            yPos += 6;
          });
          yPos += 5;
        }

        // Areas for improvement
        const improvements = chapterAnalysis.filter(ch => ch.accuracy < 70);
        if (improvements.length > 0) {
          if (yPos > pageHeight - 40) {
            addPageWithHeader();
            yPos = 50;
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(239, 68, 68);
          doc.text('Areas for Improvement (<70% accuracy):', 20, yPos);
          yPos += 8;

          improvements.forEach(chapter => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`• ${chapter.chapter} (${chapter.accuracy}%)`, 25, yPos);
            yPos += 6;
          });
        }

        yPos += 15;
      }

      // Add simple page numbers to all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Simple page number at bottom
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      const filename = `Quizzle_${subject}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      console.log('Professional PDF generated successfully');
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Calculate time spent using actual data
  const getTimeMetrics = () => {
    const actualTimeSpent = timeSpent || 0; // in seconds
    const avgTimePerQuestion = total > 0 ? Math.round(actualTimeSpent / total) : 0;
    const hours = Math.floor(actualTimeSpent / 3600);
    const minutes = Math.floor((actualTimeSpent % 3600) / 60);
    const seconds = actualTimeSpent % 60;
    
    let totalTimeFormatted;
    if (hours > 0) {
      totalTimeFormatted = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      totalTimeFormatted = `${minutes}m ${seconds}s`;
    } else {
      totalTimeFormatted = `${seconds}s`;
    }
    
    return {
      totalTime: totalTimeFormatted,
      avgPerQuestion: `${avgTimePerQuestion}s`,
      efficiency: percentage > 80 ? 'High' : percentage > 60 ? 'Medium' : 'Low'
    };
  };

  const timeMetrics = getTimeMetrics();

  // Chapter-wise Analysis Function based on actual subject lessons
  const getChapterAnalysis = () => {
    if (!questions || questions.length === 0) return null;

    // Get actual lessons for the current subject
    const getCurrentSubjectLessons = () => {
      // Import subjects here to avoid circular dependency
      const subjectMappings = {
        'data-analytics': [
          { title: 'Introduction to Data Analytics', keywords: ['introduction', 'data analytics', 'basic', 'fundamentals', 'what is data'] },
          { title: 'Data Collection Methods', keywords: ['collection', 'gathering', 'survey', 'sampling', 'sources', 'methods'] },
          { title: 'Data Cleaning and Preprocessing', keywords: ['cleaning', 'preprocessing', 'preparation', 'transformation', 'missing values'] },
          { title: 'Statistical Analysis', keywords: ['statistical', 'statistics', 'mean', 'median', 'correlation', 'regression', 'analysis'] },
          { title: 'Data Visualization', keywords: ['visualization', 'chart', 'graph', 'plot', 'matplotlib', 'seaborn', 'visual'] }
        ],
        'operating-systems': [
          { title: 'Introduction to Operating Systems', keywords: ['introduction', 'operating system', 'os', 'kernel', 'system software'] },
          { title: 'Process Management', keywords: ['process', 'thread', 'scheduling', 'deadlock', 'synchronization', 'management'] },
          { title: 'Memory Management', keywords: ['memory', 'ram', 'virtual memory', 'paging', 'segmentation'] },
          { title: 'File Systems', keywords: ['file', 'directory', 'storage', 'disk', 'filesystem', 'allocation'] },
          { title: 'System Security', keywords: ['security', 'protection', 'access control', 'authentication', 'authorization'] }
        ],
        'entrepreneurship': [
          { title: 'Introduction to Entrepreneurship', keywords: ['introduction', 'entrepreneur', 'innovation', 'startup', 'business venture'] },
          { title: 'Business Planning', keywords: ['business plan', 'planning', 'strategy', 'objectives', 'roadmap'] },
          { title: 'Market Research and Analysis', keywords: ['market research', 'analysis', 'competition', 'target market', 'industry'] },
          { title: 'Finance and Funding', keywords: ['finance', 'funding', 'investment', 'capital', 'cash flow', 'investor'] },
          { title: 'Marketing and Sales', keywords: ['marketing', 'sales', 'customer', 'promotion', 'digital marketing'] }
        ],
        'software-engineering': [
          { title: 'Introduction to Software Engineering', keywords: ['introduction', 'software engineering', 'systematic', 'principles'] },
          { title: 'Software Development Lifecycle', keywords: ['sdlc', 'development lifecycle', 'waterfall', 'agile', 'devops'] },
          { title: 'Requirements Engineering', keywords: ['requirements', 'specification', 'gathering', 'analysis', 'documentation'] },
          { title: 'Software Design and Architecture', keywords: ['design', 'architecture', 'pattern', 'structure', 'system design'] },
          { title: 'Testing and Quality Assurance', keywords: ['testing', 'quality', 'qa', 'debugging', 'validation', 'verification'] }
        ]
      };

      // Determine subject based on quiz context
      let currentSubject = subject;
      if (subject === 'full-syllabus') {
        // For full syllabus, we need to categorize by question subject
        return null; // Handle full syllabus differently
      }

      return subjectMappings[currentSubject as keyof typeof subjectMappings] || null;
    };

    const subjectLessons = getCurrentSubjectLessons();
    if (!subjectLessons) {
      // For full-syllabus or unknown subjects, group by question.subject
      if (subject === 'full-syllabus') {
        return getFullSyllabusChapterAnalysis();
      }
      return null;
    }

    // Analyze each question and categorize by actual lessons
    const chapterStats: Record<string, { correct: number; total: number; questions: number[] }> = {};
    
    questions.forEach((question, index) => {
      const questionText = question.question.toLowerCase();
      let assignedChapter = 'Other Topics';
      
      // Find matching lesson based on keywords
      for (const lesson of subjectLessons) {
        if (lesson.keywords.some(keyword => questionText.includes(keyword.toLowerCase()))) {
          assignedChapter = lesson.title;
          break;
        }
      }
      
      if (!chapterStats[assignedChapter]) {
        chapterStats[assignedChapter] = { correct: 0, total: 0, questions: [] };
      }
      
      chapterStats[assignedChapter].total++;
      chapterStats[assignedChapter].questions.push(index + 1);
      
      if (question.userAnswer === question.answer) {
        chapterStats[assignedChapter].correct++;
      }
    });

    // Calculate performance and recommendations
    const chapterAnalysis = Object.entries(chapterStats).map(([chapter, stats]) => {
      const accuracy = Math.round((stats.correct / stats.total) * 100);
      let performance = 'Needs Review';
      let color = 'text-red-600';
      let bgColor = 'bg-red-50';
      let recommendation = 'Focus on understanding core concepts and practice more questions.';
      
      if (accuracy >= 80) {
        performance = 'Excellent';
        color = 'text-green-600';
        bgColor = 'bg-green-50';
        recommendation = 'Great job! You have mastered this topic.';
      } else if (accuracy >= 70) {
        performance = 'Good';
        color = 'text-blue-600';
        bgColor = 'bg-blue-50';
        recommendation = 'Good understanding. Review a few concepts to reach mastery.';
      } else if (accuracy >= 60) {
        performance = 'Fair';
        color = 'text-yellow-600';
        bgColor = 'bg-yellow-50';
        recommendation = 'Adequate knowledge. Practice more to improve confidence.';
      }
      
      return {
        chapter,
        accuracy,
        correct: stats.correct,
        total: stats.total,
        performance,
        color,
        bgColor,
        recommendation,
        questions: stats.questions
      };
    }).sort((a, b) => b.accuracy - a.accuracy); // Sort by accuracy descending

    return chapterAnalysis;
  };

  // Separate function for full syllabus analysis
  const getFullSyllabusChapterAnalysis = () => {
    const subjectStats: Record<string, { correct: number; total: number; questions: number[] }> = {};
    
    questions.forEach((question, index) => {
      const questionSubject = question.subject || 'other';
      const subjectName = {
        'data-analytics': 'Data Analytics',
        'operating-systems': 'Operating Systems',
        'software-engineering': 'Software Engineering',
        'entrepreneurship': 'Entrepreneurship'
      }[questionSubject] || 'Other Topics';
      
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { correct: 0, total: 0, questions: [] };
      }
      
      subjectStats[subjectName].total++;
      subjectStats[subjectName].questions.push(index + 1);
      
      if (question.userAnswer === question.answer) {
        subjectStats[subjectName].correct++;
      }
    });

    return Object.entries(subjectStats).map(([chapter, stats]) => {
      const accuracy = Math.round((stats.correct / stats.total) * 100);
      let performance = 'Needs Review';
      let color = 'text-red-600';
      let bgColor = 'bg-red-50';
      let recommendation = 'Focus on understanding core concepts and practice more questions.';
      
      if (accuracy >= 80) {
        performance = 'Excellent';
        color = 'text-green-600';
        bgColor = 'bg-green-50';
        recommendation = 'Great job! You have mastered this subject area.';
      } else if (accuracy >= 70) {
        performance = 'Good';
        color = 'text-blue-600';
        bgColor = 'bg-blue-50';
        recommendation = 'Good understanding. Review a few concepts to reach mastery.';
      } else if (accuracy >= 60) {
        performance = 'Fair';
        color = 'text-yellow-600';
        bgColor = 'bg-yellow-50';
        recommendation = 'Adequate knowledge. Practice more to improve confidence.';
      }
      
      return {
        chapter,
        accuracy,
        correct: stats.correct,
        total: stats.total,
        performance,
        color,
        bgColor,
        recommendation,
        questions: stats.questions
      };
    }).sort((a, b) => b.accuracy - a.accuracy);
  };

  const chapterAnalysis = getChapterAnalysis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Export Button */}
        <div className="mb-4 sm:mb-6 text-center sm:text-right">
          <Button 
            onClick={handleExportToPDF}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        <div ref={reportRef} className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Professional Header with Brand Colors */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white px-4 sm:px-8 py-8 sm:py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Quiz Performance Report</h1>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 inline-block mb-4">
                <p className="text-base sm:text-xl font-medium">{decodeURIComponent(lessonTitle || 'Quiz Assessment')}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm opacity-90">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Star className="h-8 w-8 sm:h-16 sm:w-16 text-white" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20">
              <Brain className="h-6 w-6 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>

          {/* Score Hero Section */}
          <div className="px-4 sm:px-8 py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
            <div className="text-center mb-6 sm:mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${gradeInfo.color} shadow-2xl mb-4 sm:mb-6 relative`}>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl sm:text-3xl font-bold ${gradeInfo.textColor}`}>{percentage}%</div>
                    <div className={`text-sm sm:text-lg font-semibold ${gradeInfo.textColor}`}>{gradeInfo.grade}</div>
                  </div>
                </div>
                {isPassed && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 rounded-full p-1 sm:p-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <Badge 
                  variant={isPassed ? "default" : "destructive"} 
                  className={`text-sm sm:text-base px-3 py-1 ${isPassed ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {isPassed ? 'PASSED' : 'FAILED'}
                </Badge>
                <span className="text-sm sm:text-base text-muted-foreground">
                  Performance Level: {gradeInfo.level}
                </span>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">Correct</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-xs sm:text-sm text-red-600 font-medium">Incorrect</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{total}</div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">Total</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">{timeMetrics.totalTime}</div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">Time Taken</div>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="px-8 py-12 bg-white dark:bg-gray-800">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                Performance Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Detailed breakdown of your quiz performance</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Enhanced Accuracy Visualization */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center text-blue-700 dark:text-blue-300">
                    <Activity className="h-5 w-5 mr-2" />
                    Accuracy Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - performanceMetrics.accuracy / 100)}`}
                        className={`${gradeInfo.textColor.replace('text-', 'text-')} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${gradeInfo.textColor}`}>{performanceMetrics.accuracy}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Correct
                      </span>
                      <span className="font-semibold text-green-600">{correctAnswers} questions</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        Incorrect
                      </span>
                      <span className="font-semibold text-red-600">{incorrectAnswers} questions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Breakdown */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Correct Answers
                        </span>
                        <span className="text-sm font-bold text-green-600">{performanceMetrics.correct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${performanceMetrics.correct}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          Incorrect Answers
                        </span>
                        <span className="text-sm font-bold text-red-600">{performanceMetrics.incorrect}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-rose-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${performanceMetrics.incorrect}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">{timeMetrics.efficiency}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{gradeInfo.grade}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Grade</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                  Performance Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                      Key Metrics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <span className="text-sm">Success Rate</span>
                        <Badge variant="outline" className={`${gradeInfo.bgColor} ${gradeInfo.textColor} border-current/20`}>
                          {correctAnswers}/{total} ({Math.round((correctAnswers / total) * 100)}%)
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <span className="text-sm">Time Efficiency</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                          {timeMetrics.avgPerQuestion} per question
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <span className="text-sm">Total Time Taken</span>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">
                          {timeMetrics.totalTime}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <span className="text-sm">Overall Grade</span>
                        <Badge variant="outline" className={`${gradeInfo.bgColor} ${gradeInfo.textColor} border-current/20 font-bold`}>
                          {gradeInfo.grade} - {gradeInfo.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Star className="h-4 w-4 mr-2 text-amber-500" />
                      Recommendations
                    </h3>
                    <div className="space-y-3">
                      {percentage >= 90 && (
                        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
                          <Medal className="h-4 w-4 text-emerald-600" />
                          <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                            <strong>Outstanding!</strong> You've mastered this topic. Consider advancing to more challenging material.
                          </AlertDescription>
                        </Alert>
                      )}
                      {percentage >= 80 && percentage < 90 && (
                        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                          <Award className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-700 dark:text-blue-300">
                            <strong>Excellent work!</strong> You have a strong grasp. Review a few concepts to reach mastery.
                          </AlertDescription>
                        </Alert>
                      )}
                      {percentage >= 70 && percentage < 80 && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700 dark:text-green-300">
                            <strong>Good job!</strong> Solid understanding. Practice more questions to improve confidence.
                          </AlertDescription>
                        </Alert>
                      )}
                      {percentage >= 60 && percentage < 70 && (
                        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                          <Activity className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                            <strong>You passed!</strong> Focus on understanding the concepts you missed for better retention.
                          </AlertDescription>
                        </Alert>
                      )}
                      {percentage < 60 && (
                        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700 dark:text-red-300">
                            <strong>Keep practicing!</strong> Review the material thoroughly and take practice quizzes before retrying.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Breakdown for Full Syllabus Quiz */}
          {isFullSyllabus && subjectBreakdown && (
            <div className="px-8 py-12 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 mr-2 text-indigo-600" />
                  Subject Performance Breakdown
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Your performance across different subject areas</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {subjectBreakdown.map((subject, index) => (
                  <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className={`h-2 ${subject.colors.bg}`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">{subject.name}</h3>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${subject.colors.text}`}>{subject.score}/25</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">questions</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Accuracy</span>
                          <span className={`font-bold ${subject.colors.text}`}>{subject.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`${subject.colors.bg} h-3 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${subject.percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{subject.score} correct</span>
                          <span>{25 - subject.score} incorrect</span>
                        </div>
                      </div>
                      
                      <div className={`mt-4 p-3 rounded-lg ${subject.colors.light} border border-current/10`}>
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${subject.colors.text}`}>
                            {subject.percentage >= 80 ? 'Excellent' : 
                             subject.percentage >= 70 ? 'Good' : 
                             subject.percentage >= 60 ? 'Pass' : 'Needs Review'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Question Review */}
          <div className="px-8 py-12 bg-white dark:bg-gray-800">
            <Card className="border-0 shadow-xl">
              <Collapsible open={isQuestionsExpanded} onOpenChange={setIsQuestionsExpanded}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-xl">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Detailed Question Review
                        {questions && questions.length > 0 && (
                          <Badge variant="outline" className="ml-3">
                            {questions.length} questions
                          </Badge>
                        )}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isQuestionsExpanded ? "default" : "outline"}>
                          {isQuestionsExpanded ? 'Hide' : 'Show'} Details
                        </Badge>
                        {isQuestionsExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-6">
                    {questions && questions.length > 0 ? (
                      <div className="space-y-8">
                        {questions.map((question, index) => {
                          const isCorrect = question.userAnswer === question.answer;
                          return (
                            <div key={index} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                    isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-lg">Question {index + 1}</h3>
                                    {isFullSyllabus && question.subject && (
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        {question.subject === 'operating-systems' ? 'Operating Systems' :
                                         question.subject === 'data-analytics' ? 'Data Analytics' :
                                         question.subject === 'software-engineering' ? 'Software Engineering' :
                                         question.subject === 'entrepreneurship' ? 'Entrepreneurship' : question.subject}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {isCorrect ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  <span className="text-sm font-semibold">
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                                  {question.question}
                                </p>
                              </div>
                              
                              <div className="grid gap-3 mb-4">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex} 
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                                      option === question.answer 
                                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300' 
                                        : option === question.userAnswer && !isCorrect
                                        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <div className="quiz-option-container">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold quiz-option-circle ${
                                        option === question.answer ? 'bg-green-500 text-white' :
                                        option === question.userAnswer && !isCorrect ? 'bg-red-500 text-white' :
                                        'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </div>
                                      <span className="quiz-option-content font-medium">{option}</span>
                                      {option === question.answer && (
                                        <CheckCircle className="h-5 w-5 text-green-500 quiz-option-icon" />
                                      )}
                                      {option === question.userAnswer && !isCorrect && (
                                        <XCircle className="h-5 w-5 text-red-500 quiz-option-icon" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {!isCorrect && (
                                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                                    <div className="space-y-1">
                                      <div><strong>Your Answer:</strong> {question.userAnswer || 'Not answered'}</div>
                                      <div><strong>Correct Answer:</strong> {question.answer}</div>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No question data available</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Question details are not available for this report. Try retaking the quiz for detailed feedback.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Chapter-wise Performance Analysis */}
          {chapterAnalysis && chapterAnalysis.length > 0 && (
            <div className="px-8 py-12 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 mr-2 text-indigo-600" />
                  Chapter-wise Performance Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Detailed breakdown of your performance across different topics</p>
              </div>

              {/* Performance Summary Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {chapterAnalysis.map((chapter, index) => (
                  <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className={`h-2 ${
                      chapter.accuracy >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      chapter.accuracy >= 70 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                      chapter.accuracy >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                      'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{chapter.chapter}</h3>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${chapter.color}`}>{chapter.accuracy}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">accuracy</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Performance</span>
                          <Badge className={`${chapter.bgColor} ${chapter.color} border-current/20`}>
                            {chapter.performance}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span>Correct Answers</span>
                          <span className="font-semibold">{chapter.correct}/{chapter.total}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                              chapter.accuracy >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              chapter.accuracy >= 70 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                              chapter.accuracy >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                            style={{ width: `${chapter.accuracy}%` }}
                          />
                        </div>
                        
                        <div className={`mt-4 p-3 rounded-lg ${chapter.bgColor} border border-current/10`}>
                          <div className="text-sm">
                            <div className={`font-semibold ${chapter.color} mb-1`}>Recommendation:</div>
                            <div className="text-gray-700 dark:text-gray-300">{chapter.recommendation}</div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Questions: {chapter.questions.join(', ')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Study Recommendations */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
                    <Star className="h-5 w-5 mr-2" />
                    Personalized Study Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center text-green-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        Strengths (80%+ accuracy)
                      </h3>
                      <div className="space-y-2">
                        {chapterAnalysis.filter(ch => ch.accuracy >= 80).length > 0 ? (
                          chapterAnalysis.filter(ch => ch.accuracy >= 80).map((chapter, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="font-medium text-green-800 dark:text-green-200">{chapter.chapter}</span>
                              <Badge className="bg-green-100 text-green-800 border-green-200">{chapter.accuracy}%</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400 italic">No chapters with 80%+ accuracy yet. Keep practicing!</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center text-red-600">
                        <Target className="h-4 w-4 mr-2" />
                        Areas for Improvement (&lt;70% accuracy)
                      </h3>
                      <div className="space-y-2">
                        {chapterAnalysis.filter(ch => ch.accuracy < 70).length > 0 ? (
                          chapterAnalysis.filter(ch => ch.accuracy < 70).map((chapter, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <span className="font-medium text-red-800 dark:text-red-200">{chapter.chapter}</span>
                              <Badge className="bg-red-100 text-red-800 border-red-200">{chapter.accuracy}%</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400 italic">Great! All chapters above 70% accuracy.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Professional Footer */}
          <div className="px-8 py-8 bg-gradient-to-r from-gray-800 to-slate-900 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 mr-3">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Quizzle Learning Platform</h3>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Empowering learners with comprehensive assessments and detailed performance insights
            </p>
            <div className="text-xs text-gray-400 space-x-4">
              <span>Report Generated: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>Student Performance Analytics</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Outside PDF content) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          {isFullSyllabus ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/quiz/full-syllabus')}
                className="bg-white hover:bg-gray-50 border-2 border-blue-200 text-blue-700 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Full Syllabus Quiz
              </Button>
              
              <Button 
                onClick={() => navigate('/subjects')}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All Subjects
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Back to Home
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="bg-white hover:bg-gray-50 border-2 border-blue-200 text-blue-700 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Quiz
              </Button>
              
              <Button 
                onClick={() => navigate(`/subjects/${subject}`)}
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => navigate('/subjects')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
              >
                View All Subjects
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}