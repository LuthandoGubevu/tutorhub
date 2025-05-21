
"use client";

import type { SubmittedWork, Booking, Lesson } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mathematicsLessons, physicsLessons } from '@/lib/data'; 

interface StudentDataContextType {
  submittedWork: SubmittedWork[];
  addSubmittedWork: (work: SubmittedWork) => void;
  updateSubmittedWork: (workId: string, updates: Partial<SubmittedWork>) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

const SUBMITTED_WORK_STORAGE_KEY = 'tutorHubOnlineAcademy_submittedWork_v1';
const BOOKINGS_STORAGE_KEY = 'tutorHubOnlineAcademy_bookings_v1';

// This function is now less relevant for updates as scores are explicitly set by tutors.
// It can be kept for initial mock data or if a default score is needed on creation under specific conditions.
// For now, score assignment on initial 'Reviewed' status is removed.
const assignMockScoreIfNeeded = (work: SubmittedWork): SubmittedWork => {
  // Example: Only assign mock score if it's a new submission somehow marked 'Reviewed' and has no score.
  // This scenario is unlikely with current flow. Tutors explicitly set scores.
  // if (work.status === 'Reviewed' && typeof work.score === 'undefined') {
  //   return { ...work, score: Math.floor(Math.random() * 41) + 60 };
  // }
  return work;
};


export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submittedWork, setSubmittedWork] = useState<SubmittedWork[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWork = localStorage.getItem(SUBMITTED_WORK_STORAGE_KEY);
      if (storedWork) {
        const parsedWork = JSON.parse(storedWork) as SubmittedWork[];
        return parsedWork.map(work => {
          const lessonSet = work.lesson.subject === 'Mathematics' ? mathematicsLessons : physicsLessons;
          const fullLesson = lessonSet.find(l => l.id === work.lesson.id) || work.lesson;
          const workWithStudentId = { ...work, lesson: fullLesson, studentId: work.studentId || 'unknown_student' };
          // We don't assign mock scores here anymore on load, existing scores will be preserved.
          return workWithStudentId; 
        });
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
      localStorage.setItem(SUBMITTED_WORK_STORAGE_KEY, JSON.stringify(submittedWork));
    }
  }, [submittedWork]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  const addSubmittedWork = (newWork: SubmittedWork) => { 
    // Score is not assigned on initial submission by student
    setSubmittedWork(prev => [newWork, ...prev.filter(p => p.id !== newWork.id)].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  };

  const updateSubmittedWork = (workId: string, updates: Partial<SubmittedWork>) => {
    setSubmittedWork(prev => prev.map(work => {
      if (work.id === workId) {
        // Direct update, score comes from `updates` if provided by tutor.
        // No automatic mock score assignment here.
        return { ...work, ...updates };
      }
      return work;
    }).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
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
