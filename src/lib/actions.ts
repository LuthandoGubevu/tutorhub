
"use server";

import { suggestFeedback, type SuggestFeedbackInput, type SuggestFeedbackOutput } from '@/ai/flows/suggest-feedback';
import type { StudentAnswer, LessonFeedback, Booking, Lesson, SubmittedWork } from '@/types';
import { getLessonById } from './data';

/*
Recommended Firestore Security Rules:
(Apply these in your Firebase Console -> Firestore Database -> Rules)

service cloud.firestore {
  match /databases/{database}/documents {
    // Users Collection:
    // - Allow users to read and update their own document.
    // - Allow users to create their own document (e.g., on registration).
    // - Tutors can potentially read all user profiles if needed for display names etc.
    match /users/{userId} {
      allow read: if request.auth.uid == userId || 
                    (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
      allow create, update: if request.auth.uid == userId;
      allow delete: if false; // Deny delete unless specific admin role is implemented
    }

    // Submissions Collection (if/when migrated from localStorage to Firestore):
    // This rule grants global read access to the specified tutor email,
    // and allows other tutors to read submissions if they have an 'assignedTutor' field matching their UID.
    // Students can create submissions and only read/update their own.
    match /submissions/{submissionId} {
      allow create: if request.auth.uid == request.resource.data.studentId;
      
      allow read: if (request.auth.token.email == "lgubevu@gmail.com") || // Global admin tutor
                    (request.auth.uid == resource.data.studentId) || // Student owns the submission
                    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor' && resource.data.assignedTutor == request.auth.uid); // Assigned tutor

      allow update: if (request.auth.token.email == "lgubevu@gmail.com") || // Global admin tutor can update
                      (request.auth.uid == resource.data.studentId) || // Student might edit (if allowed by app logic)
                      (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor' && resource.data.assignedTutor == request.auth.uid); // Assigned tutor can update

      allow delete: if (request.auth.token.email == "lgubevu@gmail.com") || // Global admin tutor can delete
                      (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor' && resource.data.assignedTutor == request.auth.uid); 
    }

    // Bookings Collection (if/when migrated from localStorage to Firestore):
    match /bookings/{bookingId} {
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow read, update: if request.auth.uid == resource.data.studentId ||
                           (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
      allow delete: if (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
    }

    // LessonFeedback Collection (if/when migrated from localStorage to Firestore):
    match /lessonFeedback/{feedbackId} {
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow read: if request.auth.uid == resource.data.studentId ||
                     (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
      // allow update, delete: by owner or tutor as needed
    }
  }
}
*/


interface SubmitAnswerResult {
  success: boolean;
  newSubmission?: SubmittedWork;
  aiFeedbackSuggestion?: string;
  error?: string;
}

export async function submitAnswerAction(
  lessonId: string,
  answer: string,
  reasoning: string, 
  subject: 'Mathematics' | 'Physics',
  studentId: string 
): Promise<SubmitAnswerResult> {
  if (!answer.trim()) {
    return { success: false, error: "Answer cannot be empty." };
  }
  if (!reasoning.trim()) {
    return { success: false, error: "Reasoning cannot be empty." };
  }

  const lesson = getLessonById(subject, lessonId);
  if (!lesson) {
    return { success: false, error: "Lesson not found." };
  }
  
  const timestamp = new Date().toISOString();

  let aiSuggestion: string | undefined;
  try {
    const aiInput: SuggestFeedbackInput = {
      lessonContent: lesson.richTextContent,
      studentAnswer: answer,
      studentReasoning: reasoning, 
      lessonId: lessonId,
      studentId: studentId, 
      timestamp: timestamp,
    };
    const aiOutput: SuggestFeedbackOutput = await suggestFeedback(aiInput);
    aiSuggestion = aiOutput.feedbackSuggestion;
    console.log("AI Feedback Suggestion:", aiSuggestion);
  } catch (error) {
    console.error("Error getting AI feedback:", error);
  }
  
  const newSubmissionData: SubmittedWork = {
    id: `submission-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    lesson: lesson,
    studentId: studentId, 
    studentAnswer: answer,
    studentReasoning: reasoning, 
    submittedAt: timestamp,
    aiFeedbackSuggestion: aiSuggestion,
    status: 'Pending',
    // score will be added by tutor
  };
  
  // In a real Firestore setup, you would write newSubmissionData to a 'submissions' collection here.
  // e.g., await addDoc(collection(db, "submissions"), newSubmissionData);
  // For now, it's returned to be handled by StudentDataContext (localStorage).
  console.log("Simulating submission save (currently localStorage):", newSubmissionData);
  
  return { 
    success: true, 
    newSubmission: newSubmissionData,
    aiFeedbackSuggestion: aiSuggestion 
  };
}


interface SubmitFeedbackResult {
  success: boolean;
  feedback?: LessonFeedback;
  error?: string;
}

// studentId is passed from AuthContext
export async function submitLessonFeedbackAction(
  feedbackData: Omit<LessonFeedback, 'timestamp' | 'studentId'>, 
  studentId: string 
): Promise<SubmitFeedbackResult> {
  const timestamp = new Date().toISOString();
  const fullFeedbackData: LessonFeedback = {
    ...feedbackData, // lessonId, rating, comments
    studentId: studentId, 
    timestamp,
  };

  // In a real Firestore setup, you would write fullFeedbackData to a 'lessonFeedback' collection.
  console.log("Lesson feedback submitted (simulated, localStorage):", fullFeedbackData);
  return { success: true, feedback: fullFeedbackData };
}


interface BookSessionResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

// studentId will be passed from AuthContext
export async function bookSessionAction(
  bookingDetails: Omit<Booking, 'id' | 'studentId' | 'googleMeetLink' | 'status' | 'tutorId'>,
  studentId: string 
): Promise<BookSessionResult> {
  const newBooking: Booking = {
    ...bookingDetails,
    id: `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    studentId: studentId, 
    tutorId: "tutor_placeholder_id", // This should ideally come from available tutor data
    googleMeetLink: `https://meet.google.com/lookup/mock-${Math.random().toString(36).substring(7)}`, 
    status: 'Confirmed', 
  };

  // In a real Firestore setup, you would write newBooking to a 'bookings' collection.
  console.log("Session booked (simulated, localStorage):", newBooking);
  console.log("Google Meet link generated (simulated):", newBooking.googleMeetLink);
  return { success: true, booking: newBooking };
}


interface UpdateSubmissionResult {
  success: boolean;
  updatedSubmission?: SubmittedWork;
  error?: string;
}

export async function updateSubmissionByTutorAction(
  submissionId: string,
  tutorFeedback: string,
  newStatus: 'Reviewed' | 'Pending',
  score: number | undefined, 
  currentSubmissions: SubmittedWork[] // This reflects localStorage; Firestore would query and update directly
): Promise<UpdateSubmissionResult> {
  
  const submissionIndex = currentSubmissions.findIndex(s => s.id === submissionId);
  if (submissionIndex === -1) {
    return { success: false, error: "Submission not found." };
  }

  const submissionToUpdate = currentSubmissions[submissionIndex];
  
  const updatedSubmission: SubmittedWork = {
    ...submissionToUpdate,
    tutorFeedback: tutorFeedback,
    status: newStatus,
    score: score, // Directly use the passed score
  };
  
  // In a real Firestore setup, you would update the document in the 'submissions' collection.
  // e.g., await updateDoc(doc(db, "submissions", submissionId), { tutorFeedback, status: newStatus, score });
  console.log("Submission updated by tutor (simulated, localStorage):", updatedSubmission);
  return { success: true, updatedSubmission };
}

