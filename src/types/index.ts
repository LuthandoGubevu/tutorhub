
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
}

export interface StudentAnswer {
  lessonId: string;
  studentId: string;
  answer: string;
  studentReasoning?: string; 
  timestamp: string;
}

export interface SubmittedWork {
  id: string;
  lesson: Lesson;
  studentId: string; 
  studentAnswer: string;
  studentReasoning?: string; 
  submittedAt: string;
  aiFeedbackSuggestion?: string;
  tutorFeedback?: string;
  status: 'Pending' | 'Reviewed';
  score?: number; 
}

export interface Booking {
  id:string;
  studentId: string;
  tutorId: string; 
  subject: 'Mathematics' | 'Physics' | 'General';
  dateTime: Date;
  durationMinutes: number;
  googleMeetLink?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface LessonFeedback {
  lessonId: string;
  studentId: string; 
  rating: number;
  comments: string;
  timestamp: string;
}

export interface TutorAvailability {
  date: Date;
  timeSlots: string[]; 
}
