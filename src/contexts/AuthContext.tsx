
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
                uid: firebaseUser.uid,
                role: 'tutor', 
                email: userEmail, 
                displayName: resolvedDisplayName || 'Tutor User',
                createdAt: new Date().toISOString(),
              });
              console.log(`Created Firestore document for tutor: ${userEmail}`);
            }
            console.log(`User with email ${userEmail} assigned 'tutor' role based on hardcoded email.`);
          } else if (userDoc.exists()) {
              const userDataFromFirestore = userDoc.data() as { role?: 'student' | 'tutor', displayName?: string, fullName?: string };
              if (userDataFromFirestore.role) {
                resolvedRole = userDataFromFirestore.role;
              } else {
                console.warn(`Firestore document for UID ${firebaseUser.uid} exists but is missing the 'role' field. Defaulting to 'student' role for this session and updating Firestore.`);
                resolvedRole = 'student'; 
                 await setDoc(userDocRef, { role: 'student' }, { merge: true }); // Add role if missing
              }
              // Prefer displayName from Auth, then fullName from Firestore, then a generic one
              resolvedDisplayName = firebaseUser.displayName || userDataFromFirestore.displayName || userDataFromFirestore.fullName || 'Student User';
          } else {
            // User document doesn't exist, might be a new user (e.g., post-registration or first Google sign-in)
            // For users not matching TUTOR_EMAIL_ADDRESS, default to student.
            // The registration flow now creates this document.
            // This block primarily handles cases like Google Sign-In for a new user.
            console.warn(`Firestore document not found for UID ${firebaseUser.uid}. Defaulting to 'student' role and creating document if it was a Google Sign In.`);
            resolvedRole = 'student';
            // Check if this was a Google sign-in for a new user
            if (firebaseUser.providerData.some(provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID)) {
                await setDoc(userDocRef, {
                  uid: firebaseUser.uid,
                  role: 'student',
                  email: userEmail,
                  displayName: resolvedDisplayName || 'New Student', // Google might provide displayName
                  createdAt: new Date().toISOString(),
                });
                console.log(`Created Firestore document for new Google Sign-In student: ${userEmail}`);
            } else {
                // If it's not Google sign-in and doc is missing, it's an odd state, possibly manual deletion.
                // Log and proceed with student role for the session.
                 console.log(`User document missing for non-Google sign-in UID ${firebaseUser.uid}. This user should re-register or contact support if issues persist.`);
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
           const appUserOnError: AuthUserType = { // Fallback user object
             uid: firebaseUser.uid,
             email: firebaseUser.email,
             displayName: firebaseUser.displayName,
             role: 'student', // Fallback role
           };
          setCurrentUser(appUserOnError);
          setUserRole('student'); // Fallback role
          if (pathname === '/login' || pathname === '/register') router.replace('/dashboard'); 
        }
      } else { // No firebaseUser
        setCurrentUser(null);
        setUserRole(null);
        // Protect internal pages if user is not logged in
        const protectedPaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
        if (protectedPaths.some(p => pathname.startsWith(p)) && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
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

  const signInWithGoogle = async () => {
    setIsLoadingAuth(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle Firestore doc creation/update and redirection
    } catch (error) {
      setIsLoadingAuth(false);
      console.error("Google Sign-In failed:", error);
      throw error;
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      setCurrentUser(null); // Explicitly clear user state
      setUserRole(null);    // Explicitly clear role
      router.replace('/'); // Redirect to landing page on logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, set isLoadingAuth to false here too, though redirection might happen fast
    } finally {
        // Ensure isLoadingAuth is false even if redirection is quick or error occurs
        // The onAuthStateChanged will also set it to false, but this ensures UI is responsive.
        setIsLoadingAuth(false);
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
