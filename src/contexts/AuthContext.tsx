
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
          
          let resolvedRole: 'student' | 'tutor' | null = null;
          let resolvedDisplayName: string | null = firebaseUser.displayName;

          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data() as { role?: 'student' | 'tutor', displayName?: string };
            if (userDataFromFirestore.role) {
              resolvedRole = userDataFromFirestore.role;
            } else {
              console.warn(`Firestore document for UID ${firebaseUser.uid} exists but is missing the 'role' field. Defaulting to 'student' for testing. Please define roles explicitly in Firestore for production.`);
              resolvedRole = 'student'; // Default to student for testing
            }
            if (userDataFromFirestore.displayName) {
              resolvedDisplayName = userDataFromFirestore.displayName;
            }
          } else {
            console.warn(`Firestore document not found for UID ${firebaseUser.uid}. Defaulting to 'student' role for testing. Please create user documents with roles in Firestore for production.`);
            resolvedRole = 'student'; // Default to student for testing
          }

          const appUser: AuthUserType = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: resolvedDisplayName,
            role: resolvedRole,
          };
          setCurrentUser(appUser);
          setUserRole(appUser.role);

          const isLoginPage = pathname === '/login';
          if (isLoginPage) { 
              if (appUser.role === 'tutor') {
                router.replace('/tutor-dashboard');
              } else if (appUser.role === 'student') {
                router.replace('/dashboard');
              } else {
                // Should not happen with the default logic, but as a fallback
                router.replace('/'); 
              }
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore or processing user data:", error);
          // Keep user authenticated with Firebase, but default role for safety, or sign out.
          // For now, let's default to student and log error, but keep them signed in.
           console.warn(`Error during role processing for UID ${firebaseUser.uid}. Defaulting to 'student' role. Review Firestore setup.`, error);
           const appUserOnError: AuthUserType = {
             uid: firebaseUser.uid,
             email: firebaseUser.email,
             displayName: firebaseUser.displayName,
             role: 'student', // Default role on error for testing
           };
          setCurrentUser(appUserOnError);
          setUserRole('student');
          if (pathname === '/login') router.replace('/dashboard'); // Redirect to student dashboard
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        const protectedPaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
        if (protectedPaths.some(p => pathname.startsWith(p)) && pathname !== '/login' && pathname !== '/') {
             console.log(`AuthContext: No user, on protected path ${pathname}, redirecting to /login`);
             router.replace('/login');
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
      setIsLoadingAuth(false); // Ensure loading is false on login error
      throw error; // Error is re-thrown to be handled by the calling page
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      setCurrentUser(null); // Explicitly set user to null
      setUserRole(null);   // Explicitly set role to null
      router.push('/'); 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
       setIsLoadingAuth(false); // Ensure loading is false after logout attempt
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

