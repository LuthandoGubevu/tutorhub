
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
        // If user is signed out and NOT on the landing page or login page,
        // and the route is not public (e.g. / or /login), redirect to login.
        // AppLayout will handle redirection for its pages.
        // Specific public pages (like /) will not trigger this.
        const publicPaths = ['/', '/login'];
        if (!publicPaths.includes(pathname) && !pathname.startsWith('/_next/')) { // Add check for Next.js internal paths
            // This check is more broad, specific page layouts (AppLayout, TutorDashboardLayout)
            // will handle their own redirection logic for protected content.
            // This is a fallback.
             // console.log(`AuthContext: No user, on ${pathname}, considering redirect to /login`);
             // Potentially redirect here if needed, but AppLayout handles its own children
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
      console.error("Login failed:", error);
      setIsLoadingAuth(false); // Ensure loading is false on login error
      throw error; 
    }
  };

  const logoutUser = async () => {
    setIsLoadingAuth(true);
    try {
      await signOut(auth);
      setCurrentUser(null); 
      setUserRole(null);
      router.push('/'); // Redirect to landing page on logout
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
