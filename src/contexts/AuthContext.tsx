
"use client";

import type { User as AuthUserType } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, GoogleAuthProvider } from '@/lib/firebase'; // Import GoogleAuthProvider
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUserType, signInWithPopup } from 'firebase/auth'; // Added signInWithPopup
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Added setDoc
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: AuthUserType | null;
  userRole: 'student' | 'tutor' | null;
  isLoadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Added Google Sign-In
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TUTOR_EMAIL_ADDRESS = 'main.tutor@ikasi.com'; 

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
          let resolvedRole: 'student' | 'tutor' | null = null;
          let resolvedDisplayName: string | null = firebaseUser.displayName;
          let userEmail: string | null = firebaseUser.email;

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userEmail === TUTOR_EMAIL_ADDRESS) {
            resolvedRole = 'tutor';
            if (userDoc.exists() && userDoc.data()?.displayName) {
              resolvedDisplayName = userDoc.data()?.displayName;
            } else if (!userDoc.exists()) {
              // Create document for tutor if it doesn't exist (e.g., first Google sign-in as tutor)
              await setDoc(userDocRef, { 
                role: 'tutor', 
                email: userEmail, 
                displayName: resolvedDisplayName || 'Tutor User'
              });
              console.log(`Created Firestore document for tutor: ${userEmail}`);
            }
            console.log(`User with email ${userEmail} assigned 'tutor' role based on hardcoded email.`);
          } else if (userDoc.exists()) {
              const userDataFromFirestore = userDoc.data() as { role?: 'student' | 'tutor', displayName?: string };
              if (userDataFromFirestore.role) {
                resolvedRole = userDataFromFirestore.role;
              } else {
                console.warn(`Firestore document for UID ${firebaseUser.uid} exists but is missing the 'role' field. Defaulting to 'student' role for this session.`);
                resolvedRole = 'student'; 
                 await setDoc(userDocRef, { role: 'student' }, { merge: true }); // Add role if missing
              }
              if (userDataFromFirestore.displayName) {
                resolvedDisplayName = userDataFromFirestore.displayName;
              }
          } else {
            // User document doesn't exist, create it (e.g., first Google sign-in for a student)
            console.warn(`Firestore document not found for UID ${firebaseUser.uid}. Defaulting to 'student' role and creating document.`);
            resolvedRole = 'student';
            await setDoc(userDocRef, {
              role: 'student',
              email: userEmail,
              displayName: resolvedDisplayName || 'New Student',
              createdAt: new Date().toISOString(),
            });
            console.log(`Created Firestore document for new student: ${userEmail}`);
          }

          const appUser: AuthUserType = {
            uid: firebaseUser.uid,
            email: userEmail,
            displayName: resolvedDisplayName,
            role: resolvedRole,
          };
          setCurrentUser(appUser);
          setUserRole(appUser.role);

          const isLoginPage = pathname === '/login' || pathname === '/register';
          if (isLoginPage) { 
              if (appUser.role === 'tutor') {
                router.replace('/tutor-dashboard');
              } else { // Default to student dashboard
                router.replace('/dashboard');
              }
          }
        } catch (error) {
          console.error("Error processing user data in onAuthStateChanged:", error);
           const appUserOnError: AuthUserType = {
             uid: firebaseUser.uid,
             email: firebaseUser.email,
             displayName: firebaseUser.displayName,
             role: 'student', 
           };
          setCurrentUser(appUserOnError);
          setUserRole('student');
          if (pathname === '/login' || pathname === '/register') router.replace('/dashboard'); 
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        const protectedPaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
        if (protectedPaths.some(p => pathname.startsWith(p)) && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
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
    } catch (error) {
      setIsLoadingAuth(false); 
      throw error; 
    }
  };

  const signInWithGoogle = async () => {
    setIsLoadingAuth(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle Firestore doc creation/update and redirection
    } catch (error) {
      setIsLoadingAuth(false);
      console.error("Google Sign-In failed:", error);
      throw error; // Re-throw for the login page to handle (e.g., show a toast)
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, isLoadingAuth, loginUser, signInWithGoogle, logoutUser }}>
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
