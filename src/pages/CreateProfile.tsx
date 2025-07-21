import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Upload, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileFormData } from '@/types/user';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['student', 'instructor']).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CreateProfile() {
  const navigate = useNavigate();
  const { createProfile, loginWithEmail } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      // First try to login with existing email
      try {
        await loginWithEmail(data.email);
        navigate('/subjects');
        return;
      } catch (loginError) {
        // If login fails, create new profile
        const profileData: ProfileFormData = {
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: avatarUrl || undefined,
        };
        
        await createProfile(profileData);
        navigate('/subjects');
      }
    } catch (error) {
      console.error('Error with authentication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Quizzle!</h1>
          <p className="text-xl text-muted-foreground">
            Create your profile to start your learning journey
          </p>
        </div>

        <Card className="quiz-card">
          <CardHeader>
            <CardTitle className="text-center">Create Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {getInitials('User')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="avatar" className="text-sm font-medium cursor-pointer">
                    <div className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Upload Avatar (Optional)</span>
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name *</span>
                  </div>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address *</span>
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Role (Optional)</span>
                  </div>
                </Label>
                <Select
                  onValueChange={(value) => setValue('role', value as 'student' | 'instructor')}
                  defaultValue="student"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="instructor">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Instructor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Profile...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            By creating a profile, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
} 