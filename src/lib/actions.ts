
"use server";

import { suggestFeedback, type SuggestFeedbackInput, type SuggestFeedbackOutput } from '@/ai/flows/suggest-feedback';
import type { LessonFeedback, SubmittedWork, SubmittedWorkFirestoreData, Lesson } from '@/types';
import { getLessonById } from './data';
import { db } from './firebase'; // Import Firestore instance
import { collection, addDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

/*
Firestore Security Rules (Apply in Firebase Console -> Firestore Database -> Rules):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users Collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      // Allow tutors to read user profiles for display names if needed (e.g. on tutor dashboard)
      // allow read: if request.auth.uid == userId || (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
    }

    // Submissions Collection
    match /submittedWork/{submissionId} {
      // Students can create their own submissions
      allow create: if request.auth.uid == request.resource.data.studentId;

      // Students can read their own submissions
      // Tutors (especially the admin tutor) can read all submissions
      allow read: if request.auth.uid == resource.data.studentId ||
                    (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor') ||
                    (request.auth.token.email == "lgubevu@gmail.com"); // Specific admin tutor email

      // Tutors can update submissions (e.g., for feedback, status, score)
      allow update: if (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor') ||
                      (request.auth.token.email == "lgubevu@gmail.com");
      
      // Restrict delete, e.g., only by admin tutor or specific roles
      // allow delete: if request.auth.token.email == "lgubevu@gmail.com";
    }

    // Bookings Collection
    match /bookings/{bookingId} {
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow read, update: if request.auth.uid == resource.data.studentId ||
                           (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
      // allow delete: if (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
    }

    // LessonFeedback Collection
    match /lessonFeedback/{feedbackId} {
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow read: if request.auth.uid == resource.data.studentId ||
                     (request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tutor');
    }
  }
}
*/


interface SubmitAnswerResult {
  success: boolean;
  submissionId?: string; // Return ID of the new Firestore document
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

  const currentTimestamp = new Date().toISOString(); // For AI flow, as it expects string

  let aiSuggestion: string | undefined;
  try {
    const aiInput: SuggestFeedbackInput = {
      lessonContent: lesson.richTextContent,
      studentAnswer: answer,
      studentReasoning: reasoning,
      lessonId: lessonId,
      studentId: studentId,
      timestamp: currentTimestamp,
    };
    const aiOutput: SuggestFeedbackOutput = await suggestFeedback(aiInput);
    aiSuggestion = aiOutput.feedbackSuggestion;
    console.log("AI Feedback Suggestion:", aiSuggestion);
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    // Decide if AI error should block submission. For now, it won't.
  }

  const newSubmissionData: SubmittedWorkFirestoreData = {
    studentId: studentId,
    studentAnswer: answer,
    studentReasoning: reasoning,
    submittedAt: serverTimestamp() as Timestamp, // Use Firestore server timestamp
    aiFeedbackSuggestion: aiSuggestion,
    status: 'Pending',
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonSubject: lesson.subject,
    // score will be added by tutor
  };

  try {
    const docRef = await addDoc(collection(db, "submittedWork"), newSubmissionData);
    console.log("Submission saved to Firestore with ID:", docRef.id);
    return {
      success: true,
      submissionId: docRef.id,
      aiFeedbackSuggestion: aiSuggestion
    };
  } catch (error) {
    console.error("Error saving submission to Firestore:", error);
    return { success: false, error: "Could not save submission to database." };
  }
}


interface SubmitFeedbackResult {
  success: boolean;
  feedbackId?: string; // If saving feedback to Firestore
  error?: string;
}

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

  try {
    // Example: Saving to a 'lessonFeedback' collection in Firestore
    // const docRef = await addDoc(collection(db, "lessonFeedback"), {
    //   ...fullFeedbackData,
    //   submittedAt: serverTimestamp() // If using Firestore timestamp
    // });
    // console.log("Lesson feedback submitted to Firestore with ID:", docRef.id);
    // return { success: true, feedbackId: docRef.id };

    // For now, simulating local handling (as per original structure)
    console.log("Lesson feedback submitted (simulated):", fullFeedbackData);
    return { success: true };
  } catch (error) {
    console.error("Error submitting lesson feedback:", error);
    return { success: false, error: "Could not submit feedback." };
  }
}


interface BookSessionResult {
  success: boolean;
  bookingId?: string; // If saving to Firestore
  error?: string;
}

export async function bookSessionAction(
  bookingDetails: Omit<Booking, 'id' | 'studentId' | 'googleMeetLink' | 'status' | 'tutorId'>,
  studentId: string
): Promise<BookSessionResult> {
  const newBookingData = {
    ...bookingDetails,
    studentId: studentId,
    tutorId: "tutor_placeholder_id", // This should ideally come from available tutor data
    googleMeetLink: `https://meet.google.com/lookup/mock-${Math.random().toString(36).substring(7)}`,
    status: 'Confirmed',
    // For Firestore, convert dateTime to Firestore Timestamp
    // dateTime: Timestamp.fromDate(bookingDetails.dateTime)
  };

  try {
    // Example: Saving to a 'bookings' collection in Firestore
    // const docRef = await addDoc(collection(db, "bookings"), newBookingData);
    // console.log("Session booked to Firestore with ID:", docRef.id);
    // return { success: true, bookingId: docRef.id };
    
    // For now, simulating local handling for StudentDataContext
    const clientBooking : Booking = {
        ...newBookingData,
        id: `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        dateTime: bookingDetails.dateTime // Keep as Date for client context
    }
    console.log("Session booked (simulated for client context):", clientBooking);
    return { success: true, bookingId: clientBooking.id }; // Return ID for context
  } catch (error) {
    console.error("Error booking session:", error);
    return { success: false, error: "Could not book session." };
  }
}


interface UpdateSubmissionResult {
  success: boolean;
  error?: string;
}

export async function updateSubmissionByTutorAction(
  submissionId: string,
  tutorFeedback: string,
  newStatus: 'Reviewed' | 'Pending',
  score: number | undefined
): Promise<UpdateSubmissionResult> {

  const submissionRef = doc(db, "submittedWork", submissionId);
  const updates: Partial<SubmittedWorkFirestoreData> = {
    tutorFeedback: tutorFeedback,
    status: newStatus,
  };
  if (score !== undefined) {
    updates.score = score;
  } else {
    updates.score = undefined; // Or delete(scoreField) if you want to remove it
  }

  try {
    await updateDoc(submissionRef, updates);
    console.log("Submission updated by tutor in Firestore:", submissionId);
    return { success: true };
  } catch (error) {
    console.error("Error updating submission in Firestore:", error);
    return { success: false, error: "Could not update submission." };
  }
}
