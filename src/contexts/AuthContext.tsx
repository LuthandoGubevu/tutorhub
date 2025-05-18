
"use client";

import type { User } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Import Firebase app and auth here once Firebase is set up
// import firebase from 'firebase/app'; // Or specific imports like getAuth, onAuthStateChanged
// import 'firebase/auth';
// import 'firebase/firestore'; // For fetching user role from Firestore

interface AuthContextType {
  currentUser: User | null;
  userRole: 'student' | 'tutor' | null;
  isLoadingAuth: boolean;
  // Add Firebase auth functions like signIn, signOut, signUp here
  // For demonstration, we might add a mock login
  mockLogin: (role: 'student' | 'tutor') => void;
  mockLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'tutor' | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Start true until auth state is determined

  useEffect(() => {
    // TODO: Replace with Firebase onAuthStateChanged listener
    // This is a placeholder to simulate auth state loading
    const authCheckTimeout = setTimeout(() => {
      // In a real app, Firebase onAuthStateChanged would call setIsLoadingAuth(false)
      // and fetch user role from Firestore if a user is logged in.
      // For now, we assume no user is logged in initially.
      const storedUser = localStorage.getItem('ikasiTutoring_authUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setUserRole(parsedUser.role);
      }
      setIsLoadingAuth(false);
    }, 1000); // Simulate loading delay

    return () => clearTimeout(authCheckTimeout);

    /*
    // --- Example Firebase Integration ---
    // const auth = getAuth(); // From firebase/auth
    // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    //   if (firebaseUser) {
    //     // User is signed in
    //     // Fetch user role from Firestore
    //     const userDocRef = firebase.firestore().collection('users').doc(firebaseUser.uid);
    //     const userDoc = await userDocRef.get();
    //     if (userDoc.exists) {
    //       const userData = userDoc.data() as User; // Ensure User type matches Firestore structure
    //       setCurrentUser({
    //         uid: firebaseUser.uid,
    //         email: firebaseUser.email,
    //         displayName: firebaseUser.displayName,
    //         role: userData.role,
    //       });
    //       setUserRole(userData.role);
    //     } else {
    //       // Handle case where user exists in Auth but not Firestore (e.g., incomplete signup)
    //       setCurrentUser(null);
    //       setUserRole(null);
    //     }
    //   } else {
    //     // User is signed out
    //     setCurrentUser(null);
    //     setUserRole(null);
    //   }
    //   setIsLoadingAuth(false);
    // });
    // return () => unsubscribe(); // Cleanup subscription on unmount
    */
  }, []);

  // Mock login/logout for demonstration without full Firebase setup
  const mockLogin = (role: 'student' | 'tutor') => {
    const mockUser: User = {
      uid: `mock-${role}-${Date.now()}`,
      email: `${role}@example.com`,
      displayName: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      role: role,
    };
    setCurrentUser(mockUser);
    setUserRole(role);
    localStorage.setItem('ikasiTutoring_authUser', JSON.stringify(mockUser));
    setIsLoadingAuth(false); // In case it was still true
  };

  const mockLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('ikasiTutoring_authUser');
  };


  return (
    <AuthContext.Provider value={{ currentUser, userRole, isLoadingAuth, mockLogin, mockLogout }}>
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
