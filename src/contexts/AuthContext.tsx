
"use client";

import type { User as AuthUserType } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, GoogleAuthProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUserType, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: AuthUserType | null;
  userRole: 'student' | 'tutor' | null;
  isGlobalAdminTutor: boolean; // New property
  isLoadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// IMPORTANT: Replace this with the actual tutor's email address
const TUTOR_EMAIL_ADDRESS = 'lgubevu@gmail.com'; // Ensuring this matches your request

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserType | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'tutor' | null>(null);
  const [isGlobalAdminTutor, setIsGlobalAdminTutor] = useState<boolean>(false); // New state
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); 

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
          const userDoc = await getDoc(userDocRef);

          if (userEmail === TUTOR_EMAIL_ADDRESS) {
            resolvedRole = 'tutor';
            isSuperTutor = true; // Set flag for the special tutor
            if (userDoc.exists() && userDoc.data()?.displayName) {
              resolvedDisplayName = userDoc.data()?.displayName;
            } else if (!userDoc.exists()) {
              await setDoc(userDocRef, { 
                uid: firebaseUser.uid,
                role: 'tutor', 
                email: userEmail, 
                displayName: resolvedDisplayName || 'Tutor User',
                createdAt: new Date().toISOString(),
              }, { merge: true });
              console.log(`Created/Updated Firestore document for tutor: ${userEmail}`);
            }
            console.log(`User with email ${userEmail} assigned 'tutor' role (Global Admin).`);
          } else if (userDoc.exists()) {
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
            console.warn(`Firestore document not found for UID ${firebaseUser.uid}. Defaulting to 'student' role for this session and creating document.`);
            resolvedRole = 'student';
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              role: 'student',
              email: userEmail,
              displayName: resolvedDisplayName || 'New Student',
              createdAt: new Date().toISOString(),
            }, { merge: true });
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
          setIsGlobalAdminTutor(isSuperTutor); // Set the global admin tutor flag

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
          if (pathname === '/login' || pathname === '/register') router.replace('/dashboard'); 
        } finally {
            setIsLoadingAuth(false);
        }
      } else { 
        setCurrentUser(null);
        setUserRole(null);
        setIsGlobalAdminTutor(false);
        setIsLoadingAuth(false);
        const protectedPaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
        if (protectedPaths.some(p => pathname.startsWith(p)) && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
             router.replace('/login');
        }
      }
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
