
"use client";

import type { Booking } from '@/types'; // SubmittedWork removed
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
// SubmittedWork related imports removed (mathematicsBranches, physicsLessons)

interface StudentDataContextType {
  // submittedWork: SubmittedWork[]; // Removed
  // addSubmittedWork: (work: SubmittedWork) => void; // Removed
  // updateSubmittedWork: (workId: string, updates: Partial<SubmittedWork>) => void; // Removed
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

// const SUBMITTED_WORK_STORAGE_KEY = 'TutorHubOnlineAcademy_submittedWork_v1'; // Removed
const BOOKINGS_STORAGE_KEY = 'TutorHubOnlineAcademy_bookings_v1';

export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // submittedWork state and related useEffect for localStorage removed.
  // Components will now fetch submittedWork directly from Firestore.

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (storedBookings) {
        try {
          return JSON.parse(storedBookings).map((b: any) => ({...b, dateTime: new Date(b.dateTime)}));
        } catch (e) {
          console.error("[StudentDataContext] Error parsing bookings from localStorage:", e);
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  // addSubmittedWork and updateSubmittedWork methods removed.
  // These operations will now be handled by server actions writing directly to Firestore.

  const addBooking = (booking: Booking) => {
    setBookings(prev => {
      const updatedBookings = [booking, ...prev.filter(b => b.id !== booking.id)].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      console.log('[StudentDataContext] addBooking, new state:', updatedBookings);
      return updatedBookings;
    });
  };

  return (
    <StudentDataContext.Provider value={{ bookings, addBooking }}>
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (context === undefined) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};
