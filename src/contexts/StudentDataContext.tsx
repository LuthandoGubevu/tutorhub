
"use client";

import type { SubmittedWork, Booking, Lesson } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mathematicsBranches, physicsLessons } from '@/lib/data'; 

interface StudentDataContextType {
  submittedWork: SubmittedWork[];
  addSubmittedWork: (work: SubmittedWork) => void;
  updateSubmittedWork: (workId: string, updates: Partial<SubmittedWork>) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

const SUBMITTED_WORK_STORAGE_KEY = 'TutorHubOnlineAcademy_submittedWork_v1';
const BOOKINGS_STORAGE_KEY = 'TutorHubOnlineAcademy_bookings_v1';

export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submittedWork, setSubmittedWork] = useState<SubmittedWork[]>(() => {
    if (typeof window !== 'undefined') {
      console.log(`[StudentDataContext] Attempting to load submittedWork from localStorage key: ${SUBMITTED_WORK_STORAGE_KEY}`);
      const storedWork = localStorage.getItem(SUBMITTED_WORK_STORAGE_KEY);
      if (storedWork) {
        try {
          const parsedWork = JSON.parse(storedWork) as SubmittedWork[];
          console.log('[StudentDataContext] Loaded from localStorage:', parsedWork);
          // Rehydrate lesson objects to ensure they have the latest data from data.ts
          // and not just the potentially partial/stale data stored in localStorage.
          return parsedWork.map(work => {
            let fullLesson: Lesson | undefined = work.lesson; 
            if (work.lesson && work.lesson.subject === 'Mathematics') {
              for (const branch of mathematicsBranches) {
                const foundLesson = branch.lessons.find(l => l.id === work.lesson.id);
                if (foundLesson) {
                  fullLesson = foundLesson;
                  break;
                }
              }
            } else if (work.lesson && work.lesson.subject === 'Physics') {
              fullLesson = physicsLessons.find(l => l.id === work.lesson.id) || work.lesson;
            }
            
            // Ensure studentId is present (this was added previously)
            const workWithStudentId = { 
              ...work, 
              lesson: fullLesson || work.lesson, // Fallback to stored lesson if not found
              studentId: work.studentId || 'unknown_student' 
            };
            return workWithStudentId; 
          });
        } catch (e) {
          console.error("[StudentDataContext] Error parsing submittedWork from localStorage:", e);
          return [];
        }
      } else {
        console.log("[StudentDataContext] No submittedWork found in localStorage.");
      }
      return [];
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
      console.log(`[StudentDataContext] Saving submittedWork to localStorage:`, submittedWork);
      localStorage.setItem(SUBMITTED_WORK_STORAGE_KEY, JSON.stringify(submittedWork));
    }
  }, [submittedWork]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  const addSubmittedWork = (newWork: SubmittedWork) => { 
    setSubmittedWork(prev => {
      const updatedWork = [newWork, ...prev.filter(p => p.id !== newWork.id)].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      console.log('[StudentDataContext] addSubmittedWork, new state:', updatedWork);
      return updatedWork;
    });
  };

  const updateSubmittedWork = (workId: string, updates: Partial<SubmittedWork>) => {
    setSubmittedWork(prev => {
      const updatedWork = prev.map(work => {
        if (work.id === workId) {
          return { ...work, ...updates };
        }
        return work;
      }).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      console.log('[StudentDataContext] updateSubmittedWork, new state for ID ' + workId + ':', updatedWork);
      return updatedWork;
    });
  };

  const addBooking = (booking: Booking) => {
    setBookings(prev => {
      const updatedBookings = [booking, ...prev].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      console.log('[StudentDataContext] addBooking, new state:', updatedBookings);
      return updatedBookings;
    });
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
