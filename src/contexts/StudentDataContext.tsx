
"use client";

import type { SubmittedWork, Booking } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StudentDataContextType {
  submittedWork: SubmittedWork[];
  addSubmittedWork: (work: SubmittedWork) => void;
  updateSubmittedWork: (workId: string, updates: Partial<SubmittedWork>) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

const SUBMITTED_WORK_STORAGE_KEY = 'eduPrepPro_submittedWork';
const BOOKINGS_STORAGE_KEY = 'eduPrepPro_bookings';

export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submittedWork, setSubmittedWork] = useState<SubmittedWork[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWork = localStorage.getItem(SUBMITTED_WORK_STORAGE_KEY);
      return storedWork ? JSON.parse(storedWork) : [];
    }
    return [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      return storedBookings ? JSON.parse(storedBookings).map((b: any) => ({...b, dateTime: new Date(b.dateTime)})) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBMITTED_WORK_STORAGE_KEY, JSON.stringify(submittedWork));
    }
  }, [submittedWork]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  const addSubmittedWork = (work: SubmittedWork) => {
    setSubmittedWork(prev => [work, ...prev]);
  };

  const updateSubmittedWork = (workId: string, updates: Partial<SubmittedWork>) => {
    setSubmittedWork(prev => prev.map(work => work.id === workId ? {...work, ...updates} : work));
  };

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
  };

  return (
    <StudentDataContext.Provider value={{ submittedWork, addSubmittedWork, updateSubmittedWork, bookings, addBooking }}>
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
