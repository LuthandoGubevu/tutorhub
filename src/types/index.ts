
import type { LucideProps } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'student' | 'tutor' | null;
}

export interface Lesson {
  id: string;
  subject: 'Mathematics' | 'Physics';
  title: string;
  videoUrl?: string;
  richTextContent: string;
  question: string;
  exampleSolution?: string;
}

export interface Branch {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  icon?: React.ComponentType<LucideProps>;
}

// This type is for client-side representation, after fetching from Firestore and combining with full lesson data
export interface SubmittedWork {
  id: string; // Firestore document ID
  lesson: Lesson; // Full lesson object, reconstructed on client
  studentId: string;
  studentAnswer: string;
  studentReasoning?: string;
  submittedAt: string; // ISO string date
  aiFeedbackSuggestion?: string;
  tutorFeedback?: string;
  status: 'Pending' | 'Reviewed';
  score?: number;
  // Fields stored directly in Firestore for easier querying/denormalization
  lessonId: string;
  lessonTitle: string;
  lessonSubject: 'Mathematics' | 'Physics';
}

// This represents the structure in Firestore
export interface SubmittedWorkFirestoreData {
  studentId: string;
  studentAnswer: string;
  studentReasoning?: string;
  submittedAt: Timestamp; // Firestore Timestamp
  aiFeedbackSuggestion?: string;
  tutorFeedback?: string;
  status: 'Pending' | 'Reviewed';
  score?: number;
  lessonId: string;
  lessonTitle: string;
  lessonSubject: 'Mathematics' | 'Physics';
}


export interface Booking {
  id:string;
  studentId: string;
  tutorId: string;
  subject: 'Mathematics' | 'Physics' | 'General';
  dateTime: Date; // Keep as Date for client, Firestore handles conversion
  durationMinutes: number;
  googleMeetLink?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface LessonFeedback {
  lessonId: string;
  studentId: string;
  rating: number;
  comments: string;
  timestamp: string; // ISO string date
}

export interface TutorAvailability {
  date: Date;
  timeSlots: string[];
}
