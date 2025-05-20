
"use client";

import type { SubmittedWork, Booking, Lesson } from '@/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mathematicsLessons, physicsLessons } from '@/lib/data'; // Import lessons for score mocking

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

// Helper to assign a mock score if work is reviewed
const assignMockScoreIfNeeded = (work: SubmittedWork): SubmittedWork => {
  if (work.status === 'Reviewed' && typeof work.score === 'undefined') {
    // Assign a random score between 60 and 100 for reviewed items if no score exists
    return { ...work, score: Math.floor(Math.random() * 41) + 60 };
  }
  return work;
};


export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submittedWork, setSubmittedWork] = useState<SubmittedWork[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWork = localStorage.getItem(SUBMITTED_WORK_STORAGE_KEY);
      if (storedWork) {
        const parsedWork = JSON.parse(storedWork) as SubmittedWork[];
        // Ensure lessons are correctly hydrated and scores are potentially assigned
        return parsedWork.map(work => {
          const lessonSet = work.lesson.subject === 'Mathematics' ? mathematicsLessons : physicsLessons;
          const fullLesson = lessonSet.find(l => l.id === work.lesson.id) || work.lesson;
          // Ensure studentId is present, assign mock if somehow missing from old data
          const workWithStudentId = { ...work, lesson: fullLesson, studentId: work.studentId || 'unknown_student' };
          return assignMockScoreIfNeeded(workWithStudentId);
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

  const addSubmittedWork = (newWork: SubmittedWork) => { // Parameter is now newWork
    const workWithScore = assignMockScoreIfNeeded(newWork); // newWork already has studentId from submitAnswerAction
    setSubmittedWork(prev => [workWithScore, ...prev.filter(p => p.id !== workWithScore.id)].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  };

  const updateSubmittedWork = (workId: string, updates: Partial<SubmittedWork>) => {
    setSubmittedWork(prev => prev.map(work => {
      if (work.id === workId) {
        let updatedWork = { ...work, ...updates };
        // If status is being set to 'Reviewed' and no score exists, or if a score is explicitly passed in updates
        if (updates.status === 'Reviewed' && typeof updatedWork.score === 'undefined') {
             updatedWork = assignMockScoreIfNeeded(updatedWork);
        }
        return updatedWork;
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
