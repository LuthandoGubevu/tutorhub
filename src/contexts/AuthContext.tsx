
"use client";

import type { User as AuthUserType } from '@/types'; // Renamed to avoid conflict
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase'; // Import Firebase instances
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUserType } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname

interface AuthContextType {
  currentUser: AuthUserType | null;
  userRole: 'student' | 'tutor' | null;
  isLoadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserType | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'tutor' | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      setIsLoadingAuth(true); 
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data() as { role: 'student' | 'tutor', displayName?: string };
            
            if (!userDataFromFirestore.role) {
              console.error("User document for UID:", firebaseUser.uid, "is missing the 'role' field.");
              await signOut(auth); 
              setCurrentUser(null);
              setUserRole(null);
              if (pathname !== '/' && pathname !== '/login') router.replace('/login');
            } else {
              const appUser: AuthUserType = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userDataFromFirestore.displayName || firebaseUser.displayName,
                role: userDataFromFirestore.role,
              };
              setCurrentUser(appUser);
              setUserRole(appUser.role);

              const isLoginPage = pathname === '/login';
              if (isLoginPage) { 
                  if (appUser.role === 'tutor') {
                    router.replace('/tutor-dashboard');
                  } else if (appUser.role === 'student') {
                    router.replace('/dashboard');
                  }
              } else {
                // If user is already logged in and on a page that's not login,
                // and role is determined, this logic might be redundant if AppLayout also handles it,
                // but it can serve as a fallback.
                // Example: If somehow user lands on /mathematics before role is fully set by AppLayout's effect.
              }
            }
          } else {
            console.error("User document not found in Firestore for UID:", firebaseUser.uid);
            await signOut(auth); 
            setCurrentUser(null); 
            setUserRole(null);
            if (pathname !== '/' && pathname !== '/login') router.replace('/login'); 
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          await signOut(auth); 
          setCurrentUser(null);
          setUserRole(null);
          if (pathname !== '/' && pathname !== '/login') router.replace('/login');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        const protectedPaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
        // Check if the current path is one of the protected ones, excluding parameterized lesson routes for now
        // More specific layouts (AppLayout, TutorDashboardLayout) handle their specific children.
        if (protectedPaths.some(p => pathname.startsWith(p)) && pathname !== '/login') {
            // console.log(`AuthContext: No user, on protected path ${pathname}, redirecting to /login`);
            // router.replace('/login'); // AppLayout and TutorDashboardLayout handle this more specifically.
        }
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const loginUser = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting user, role, and redirection
    } catch (error) {
      // console.error("Login failed:", error); // Removed this line
      setIsLoadingAuth(false); // Ensure loading is false on login error
      throw error; // Error is re-thrown to be handled by the calling page
    }
    // Do not set isLoadingAuth to false here if login is successful,
    // onAuthStateChanged will trigger and set it appropriately after role fetching.
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      // Setting user and role to null is handled by onAuthStateChanged
      router.push('/'); // Redirect to landing page on logout
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
       // onAuthStateChanged will set isLoadingAuth to false after user state is null
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, isLoadingAuth, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
