import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import { Subjects } from "./pages/Subjects";
import { SubjectDetail } from "./pages/SubjectDetail";
import LessonQuiz from "./pages/LessonQuiz";
import SubjectQuiz from "./pages/SubjectQuiz";
import FullSyllabusQuiz from "./pages/FullSyllabusQuiz";
import QuizReport from "./pages/QuizReport";
import { Profile } from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-background">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="/subjects" element={
                  <ProtectedRoute>
                    <Subjects />
                  </ProtectedRoute>
                } />
                <Route path="/subjects/:subjectId" element={
                  <ProtectedRoute>
                    <SubjectDetail />
                  </ProtectedRoute>
                } />
                <Route path="/quiz/:lessonTitle" element={
                  <ProtectedRoute>
                    <LessonQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/subject-quiz/:subjectId" element={
                  <ProtectedRoute>
                    <SubjectQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/quiz/full-syllabus" element={
                  <ProtectedRoute>
                    <FullSyllabusQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/quiz-report" element={
                  <ProtectedRoute>
                    <QuizReport />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
