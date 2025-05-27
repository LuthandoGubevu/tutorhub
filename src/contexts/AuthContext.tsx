
"use client";

import type { User as AuthUserType } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, GoogleAuthProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUserType, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: AuthUserType | null;
  userRole: 'student' | 'tutor' | null;
  isGlobalAdminTutor: boolean;
  isLoadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// IMPORTANT: This email address identifies the single global admin tutor.
const TUTOR_EMAIL_ADDRESS = 'lgubevu@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserType | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'tutor' | null>(null);
  const [isGlobalAdminTutor, setIsGlobalAdminTutor] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      setIsLoadingAuth(true);
      if (firebaseUser) {
        console.log("Auth State Changed - User UID:", firebaseUser.uid, "Email:", firebaseUser.email);
        try {
          let resolvedRole: 'student' | 'tutor' | null = null;
          let resolvedDisplayName: string | null = firebaseUser.displayName;
          let userEmail: string | null = firebaseUser.email;
          let isSuperTutor = false;

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          if (userEmail === TUTOR_EMAIL_ADDRESS) {
            resolvedRole = 'tutor';
            isSuperTutor = true;
            const tutorDoc = await getDoc(userDocRef);
            if (!tutorDoc.exists() || tutorDoc.data()?.role !== 'tutor') {
              await setDoc(userDocRef, { 
                uid: firebaseUser.uid,
                role: 'tutor', 
                email: userEmail, 
                displayName: resolvedDisplayName || 'TutorHub Admin',
                createdAt: tutorDoc.exists() ? tutorDoc.data()?.createdAt : new Date().toISOString(),
              }, { merge: true });
              console.log(`Ensured Firestore document role is 'tutor' for admin tutor: ${userEmail}`);
            }
            resolvedDisplayName = tutorDoc.data()?.displayName || resolvedDisplayName || 'TutorHub Admin';
          } else {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userDataFromFirestore = userDoc.data() as { role?: 'student' | 'tutor', displayName?: string, fullName?: string };
              if (userDataFromFirestore.role) {
                resolvedRole = userDataFromFirestore.role;
              } else {
                console.warn(`Firestore document for UID ${firebaseUser.uid} exists but is missing 'role'. Defaulting to 'student' and updating Firestore.`);
                resolvedRole = 'student'; 
                await setDoc(userDocRef, { role: 'student' }, { merge: true });
              }
              resolvedDisplayName = firebaseUser.displayName || userDataFromFirestore.displayName || userDataFromFirestore.fullName || 'Student User';
            } else {
              // This case is primarily for Google Sign-In or if a user was created in Auth but not Firestore
              console.warn(`Firestore document not found for UID ${firebaseUser.uid}. Defaulting to 'student' role and creating document.`);
              resolvedRole = 'student';
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                role: 'student',
                email: userEmail,
                displayName: resolvedDisplayName || 'New Student',
                createdAt: new Date().toISOString(),
              }, { merge: true });
            }
          }

          const appUser: AuthUserType = {
            uid: firebaseUser.uid,
            email: userEmail,
            displayName: resolvedDisplayName,
            role: resolvedRole,
          };
          setCurrentUser(appUser);
setUserRole(appUser.role);
          setIsGlobalAdminTutor(isSuperTutor);

          const isAuthPage = pathname === '/login' || pathname === '/register';
          if (isAuthPage) { 
            if (appUser.role === 'tutor') {
              router.replace('/tutor-dashboard');
            } else { 
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
          setIsGlobalAdminTutor(false);
          // Avoid redirect loop if already on an auth page
          if (pathname === '/login' || pathname === '/register') {
            // Potentially show an error toast, but don't auto-redirect here
            // as the error might be during role fetching, not auth itself
          } else {
             router.replace('/login'); // Fallback to login if major error during role processing
          }
        } finally {
          setIsLoadingAuth(false);
        }
      } else { 
        setCurrentUser(null);
setUserRole(null);
        setIsGlobalAdminTutor(false);
        setIsLoadingAuth(false);
        const protectedPaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
        const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p));
        if (isProtectedPath && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
          router.replace('/login');
        }
      }
    });
    return () => unsubscribe();
  }, [router, pathname, toast]); // Added toast to dependency array

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

  const signInWithGoogle = async () => {
    setIsLoadingAuth(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle Firestore doc creation/update and redirection
    } catch (error: any) {
      setIsLoadingAuth(false);
      console.error("Google Sign-In failed:", error);
      throw error;
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      router.replace('/'); 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, isGlobalAdminTutor, isLoadingAuth, loginUser, signInWithGoogle, logoutUser }}>
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
