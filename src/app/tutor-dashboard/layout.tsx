
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; 
import { useEffect, type ReactNode } from 'react';
import AppLayout from '@/components/AppLayout'; 
import { Loader2 } from 'lucide-react';

export default function TutorDashboardLayout({ children }: { children: ReactNode }) {
  const { currentUser, userRole, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!currentUser) {
        console.log("TutorLayout: No current user, redirecting to /login");
        router.replace('/login');
      } else if (userRole !== 'tutor') {
        console.log(`TutorLayout: User is not a tutor (role: ${userRole}), redirecting to /dashboard`);
        router.replace('/dashboard'); 
      } else {
        // console.log("TutorLayout: User is tutor, access granted."); // Optional: for debugging
      }
    }
  }, [currentUser, userRole, isLoadingAuth, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Authentication...</p>
      </div>
    );
  }

  if (!currentUser || userRole !== 'tutor') {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

