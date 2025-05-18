
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { mockLogin, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      // If user is already logged in, redirect to their respective dashboard
      if (currentUser.role === 'tutor') {
        router.replace('/tutor-dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, router]);

  const handleLoginAsStudent = () => {
    mockLogin('student');
    // router.push('/dashboard'); // AuthContext useEffect will handle redirect
  };

  const handleLoginAsTutor = () => {
    mockLogin('tutor');
    // router.push('/tutor-dashboard'); // AuthContext useEffect will handle redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-accent p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to iKasi Tutoring</CardTitle>
          <CardDescription className="text-md">Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* In a real app, replace these buttons with actual Firebase login UI */}
          <div className="space-y-3">
            <Button onClick={handleLoginAsStudent} className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Sign In as Student (Mock)
            </Button>
            <Button onClick={handleLoginAsTutor} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Sign In as Tutor (Mock)
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            This is a simplified login for demonstration. A full implementation would use Firebase Authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
