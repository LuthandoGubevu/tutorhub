
export interface Lesson {
  id: string;
  subject: 'Mathematics' | 'Physics';
  title: string;
  videoUrl?: string; 
  richTextContent: string; 
  question: string; 
  exampleSolution?: string; 
}

export interface StudentAnswer {
  lessonId: string;
  studentId: string; 
  answer: string;
  timestamp: string; 
}

export interface SubmittedWork {
  id: string; 
  lesson: Lesson;
  studentAnswer: string;
  submittedAt: string; 
  aiFeedbackSuggestion?: string;
  tutorFeedback?: string;
  status: 'Pending' | 'Reviewed'; 
}

export interface Booking {
  id:string;
  studentId: string;
  tutorId: string; // Mock
  subject: 'Mathematics' | 'Physics' | 'General';
  dateTime: Date;
  durationMinutes: number;
  googleMeetLink?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface LessonFeedback {
  lessonId: string;
  studentId: string; // Mock
  rating: number; 
  comments: string;
  timestamp: string;
}

export interface TutorAvailability {
  date: Date;
  timeSlots: string[]; // e.g., "09:00", "09:30"
}
