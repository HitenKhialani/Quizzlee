import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Header: React.FC = () => {
  const { isAuthenticated, checkAuth, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-lg sm:text-xl font-bold gradient-text">Quizzle</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/subjects" className="text-sm font-medium hover:text-primary transition-colors">
              Subjects
            </Link>
            <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
              Profile
            </Link>
          </nav>
          
          <ThemeToggle />
          
          {isAuthenticated || checkAuth() ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden lg:inline">
                Welcome, {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/create-profile">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold gradient-text">Quizzle</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <nav className="flex flex-col space-y-4 flex-1">
                  <Link 
                    to="/" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/subjects" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Subjects
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </nav>
                
                <div className="border-t pt-4">
                  {isAuthenticated || checkAuth() ? (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Welcome, {user?.name}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Link to="/create-profile" className="block">
                      <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};