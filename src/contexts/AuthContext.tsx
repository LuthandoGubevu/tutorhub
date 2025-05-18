
"use client";

import type { User as AuthUserType } from '@/types'; // Renamed to avoid conflict
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase'; // Import Firebase instances
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUserType } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data() as { role: 'student' | 'tutor', displayName?: string }; // Define more clearly based on your Firestore structure
            const appUser: AuthUserType = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: userDataFromFirestore.displayName || firebaseUser.displayName, // Prefer Firestore displayName
              role: userDataFromFirestore.role,
            };
            setCurrentUser(appUser);
            setUserRole(appUser.role);

             // Redirect based on role after fetching
            if (appUser.role === 'tutor') {
              router.replace('/tutor-dashboard');
            } else {
              router.replace('/dashboard');
            }

          } else {
            // Handle case where user exists in Auth but not Firestore (e.g., incomplete signup)
            console.error("User document not found in Firestore for UID:", firebaseUser.uid);
            setCurrentUser(null); // Or a minimal user object if preferred
            setUserRole(null);
            await signOut(auth); // Sign out user if their Firestore record is missing
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          setCurrentUser(null);
          setUserRole(null);
          // Optionally sign out user if there's an error fetching critical role data
          // await signOut(auth); 
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserRole(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  const loginUser = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting user and role, and redirecting
    } catch (error) {
      setIsLoadingAuth(false);
      console.error("Login failed:", error);
      // Propagate error to UI if needed
      throw error; 
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing user and role
      setCurrentUser(null); // Explicitly clear state
      setUserRole(null);
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, ensure local state is cleared and UI reflects loading finished
    } finally {
        setIsLoadingAuth(false);
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
