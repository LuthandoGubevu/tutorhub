
"use client";

import type { User as AuthUserType } from '@/types'; // Renamed to avoid conflict
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase'; // Import Firebase instances
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUserType } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: AuthUserType | null;
  userRole: 'student' | 'tutor' | null;
  isLoadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// !!! IMPORTANT: REPLACE THIS WITH THE ACTUAL TUTOR'S EMAIL ADDRESS !!!
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

          if (firebaseUser.email === TUTOR_EMAIL_ADDRESS) {
            resolvedRole = 'tutor';
            const userDocRefTutor = doc(db, 'users', firebaseUser.uid);
            const userDocTutor = await getDoc(userDocRefTutor);
            if (userDocTutor.exists() && userDocTutor.data()?.displayName) {
              resolvedDisplayName = userDocTutor.data()?.displayName;
            }
             console.log(`User with email ${firebaseUser.email} assigned 'tutor' role based on hardcoded email.`);
          } else {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userDataFromFirestore = userDoc.data() as { role?: 'student' | 'tutor', displayName?: string };
              if (userDataFromFirestore.role) {
                resolvedRole = userDataFromFirestore.role;
              } else {
                console.warn(`Firestore document for UID ${firebaseUser.uid} exists but is missing the 'role' field. Defaulting to 'student' role for this session. Please define roles explicitly in Firestore for production.`);
                resolvedRole = 'student'; 
              }
              if (userDataFromFirestore.displayName) {
                resolvedDisplayName = userDataFromFirestore.displayName;
              }
            } else {
              console.warn(`Firestore document not found for UID ${firebaseUser.uid}. Defaulting to 'student' role for this session as not the designated tutor email. Please create user documents with roles in Firestore for production.`);
              resolvedRole = 'student'; 
            }
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
                console.warn("User authenticated but role could not be determined, redirecting to landing.");
                router.replace('/'); 
              }
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore or processing user data:", error);
           const appUserOnError: AuthUserType = {
             uid: firebaseUser.uid,
             email: firebaseUser.email,
             displayName: firebaseUser.displayName,
             role: 'student', // Default role on error
           };
          setCurrentUser(appUserOnError);
          setUserRole('student');
          if (pathname === '/login') router.replace('/dashboard'); 
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
      setIsLoadingAuth(false); 
      throw error; 
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      // setCurrentUser and setUserRole will be handled by onAuthStateChanged
      // Redirection to '/' is handled by onAuthStateChanged when user becomes null and is on a protected route.
      // Explicit redirect if needed after signOut if current page isn't automatically handled:
      router.replace('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
    // onAuthStateChanged will eventually set isLoadingAuth to false.
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
