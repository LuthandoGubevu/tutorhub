
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
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      setIsLoadingAuth(true); // Set loading true at the start of auth check
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data() as { role: 'student' | 'tutor', displayName?: string };
            
            if (!userDataFromFirestore.role) {
              console.error("User document for UID:", firebaseUser.uid, "is missing the 'role' field.");
              await signOut(auth); // Sign out if role is critical and missing
              setCurrentUser(null);
              setUserRole(null);
              // router.replace('/login'); // Redirect if role is missing
            } else {
              const appUser: AuthUserType = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userDataFromFirestore.displayName || firebaseUser.displayName,
                role: userDataFromFirestore.role,
              };
              setCurrentUser(appUser);
              setUserRole(appUser.role);

              // Redirect based on role only if not already on a target dashboard or login page
              const isLoginPage = pathname === '/login';
              if (!isLoginPage) { // Avoid redirect loop from login page
                  if (appUser.role === 'tutor' && pathname !== '/tutor-dashboard' && !pathname.startsWith('/tutor-dashboard/')) {
                    router.replace('/tutor-dashboard');
                  } else if (appUser.role === 'student' && pathname !== '/dashboard' && !pathname.startsWith('/dashboard/')) {
                    router.replace('/dashboard');
                  }
              }
            }
          } else {
            console.error("User document not found in Firestore for UID:", firebaseUser.uid);
            await signOut(auth); // Sign out user if their Firestore record is missing
            setCurrentUser(null); 
            setUserRole(null);
            // if (pathname !== '/login') router.replace('/login'); // Redirect if critical user data missing
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          await signOut(auth); // Sign out on error fetching role
          setCurrentUser(null);
          setUserRole(null);
          // if (pathname !== '/login') router.replace('/login');
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserRole(null);
        // If user is signed out and not on login or public landing page, redirect to login
        // This needs to be careful not to cause redirect loops, e.g. if / is public
        // if (pathname !== '/login' && pathname !== '/') {
        //    router.replace('/login');
        // }
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router, pathname]); // Add pathname to dependencies

  const loginUser = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting user, role, and initial redirection
    } catch (error) {
      // setIsLoadingAuth(false); // onAuthStateChanged will set this after its flow
      console.error("Login failed:", error);
      throw error; 
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      setCurrentUser(null); 
      setUserRole(null);
      router.push('/login'); 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
        // onAuthStateChanged will eventually set isLoadingAuth to false
        // but we can set it here if needed, though typically not.
        // setIsLoadingAuth(false); 
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

