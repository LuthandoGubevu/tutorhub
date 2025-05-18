
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { loginUser, currentUser, isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!isLoadingAuth && currentUser) {
      // If user is already logged in and auth is not loading, redirect
      // AuthContext also handles redirection, this is a fallback for direct navigation to /login
      if (currentUser.role === 'tutor') {
        router.replace('/tutor-dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, isLoadingAuth, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await loginUser(email, password);
      // If loginUser succeeds, onAuthStateChanged in AuthContext will handle
      // role fetching and redirection.
      toast({ title: "Processing Login", description: "Please wait..." });
    } catch (error: any) {
      // console.error("Login page error:", error); // Removed this line
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      toast({ title: "Login Error", description: errorMessage, variant: "destructive" });
    } finally {
      // Ensures the button is re-enabled if the user remains on the login page
      // for any reason after the login attempt (e.g., network error during role fetch after auth success but before redirect).
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-accent p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-foreground" />
        <p className="ml-4 text-lg text-primary-foreground">Loading...</p>
      </div>
    );
  }
  
  // If user is already logged in (and not loading), they will be redirected by useEffect or AuthContext.
  // This prevents flicker of the login form.
  if (currentUser) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-accent p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-foreground" />
        <p className="ml-4 text-lg text-primary-foreground">Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-accent p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to iKasi Tutoring</CardTitle>
          <CardDescription className="text-md">Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isLoadingAuth}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-6">
            This platform uses Firebase Authentication. Ensure your account is set up with the correct role in Firestore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
