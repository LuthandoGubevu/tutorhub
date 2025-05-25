
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
  isLoadingAuth: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// IMPORTANT: Replace this with the actual tutor's email address
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
        console.log("Auth State Changed - User UID:", firebaseUser.uid); // AI Suggested Logging
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
              // Create document for tutor if it doesn't exist
              await setDoc(userDocRef, { 
                uid: firebaseUser.uid,
                role: 'tutor', 
                email: userEmail, 
                displayName: resolvedDisplayName || 'Tutor User', // Use Firebase Auth display name if available
                createdAt: new Date().toISOString(),
              }, { merge: true }); // Use merge to avoid overwriting existing fields if any
              console.log(`Created/Updated Firestore document for tutor: ${userEmail}`);
            }
            console.log(`User with email ${userEmail} assigned 'tutor' role based on hardcoded email.`);
          } else if (userDoc.exists()) {
              const userDataFromFirestore = userDoc.data() as { role?: 'student' | 'tutor', displayName?: string, fullName?: string }; // fullName from registration
              if (userDataFromFirestore.role) {
                resolvedRole = userDataFromFirestore.role;
              } else {
                console.warn(`Firestore document for UID ${firebaseUser.uid} exists but is missing the 'role' field. Defaulting to 'student' role for this session and updating Firestore.`);
                resolvedRole = 'student'; 
                 await setDoc(userDocRef, { role: 'student' }, { merge: true });
              }
              resolvedDisplayName = firebaseUser.displayName || userDataFromFirestore.displayName || userDataFromFirestore.fullName || 'Student User';
          } else {
            // User document doesn't exist, likely a new user post-registration or first Google sign-in
            console.warn(`Firestore document not found for UID ${firebaseUser.uid}. This should have been created during registration or Google Sign-In. Defaulting to 'student' role for this session.`);
            resolvedRole = 'student';
             // If it's a Google Sign-In and the doc is missing, create it.
            if (firebaseUser.providerData.some(provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID)) {
                await setDoc(userDocRef, {
                  uid: firebaseUser.uid,
                  role: 'student',
                  email: userEmail,
                  displayName: resolvedDisplayName || 'New Student',
                  createdAt: new Date().toISOString(),
                }, { merge: true });
                console.log(`Created Firestore document for new Google Sign-In student: ${userEmail}`);
            } else {
                 // If it's email/password registration, the /register page should have created this.
                 // This path suggests something went wrong, or manual deletion.
                console.log(`User document missing for UID ${firebaseUser.uid}. Registration flow should create this.`)
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
          if (pathname === '/login' || pathname === '/register') router.replace('/dashboard'); 
        } finally {
            setIsLoadingAuth(false); // Set loading to false after processing
        }
      } else { 
        setCurrentUser(null);
        setUserRole(null);
        setIsLoadingAuth(false); // Set loading to false if no user
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
      // setCurrentUser(null) and setUserRole(null) will be handled by onAuthStateChanged
      router.replace('/'); 
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoadingAuth(false); // Ensure loading is false on error
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
