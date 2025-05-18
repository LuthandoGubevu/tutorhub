
"use server";

import { suggestFeedback, type SuggestFeedbackInput, type SuggestFeedbackOutput } from '@/ai/flows/suggest-feedback';
import type { StudentAnswer, LessonFeedback, Booking, Lesson } from '@/types';
import { getLessonById } from './data';

// Simulate student ID for now
const MOCK_STUDENT_ID = "student123";

interface SubmitAnswerResult {
  success: boolean;
  submittedAnswer?: StudentAnswer;
  aiFeedbackSuggestion?: string;
  error?: string;
}

export async function submitAnswerAction(
  lessonId: string,
  answer: string,
  subject: 'Mathematics' | 'Physics'
): Promise<SubmitAnswerResult> {
  if (!answer.trim()) {
    return { success: false, error: "Answer cannot be empty." };
  }

  const lesson = getLessonById(subject, lessonId);
  if (!lesson) {
    return { success: false, error: "Lesson not found." };
  }
  
  const timestamp = new Date().toISOString();
  const studentAnswerData: StudentAnswer = {
    lessonId,
    studentId: MOCK_STUDENT_ID,
    answer,
    timestamp,
  };

  // Log data that would be sent to the tutor
  console.log("Answer submitted to tutor (simulated):", studentAnswerData);

  // Call AI flow
  let aiSuggestion: string | undefined;
  try {
    const aiInput: SuggestFeedbackInput = {
      lessonContent: lesson.richTextContent,
      studentAnswer: answer,
      lessonId: lessonId,
      studentId: MOCK_STUDENT_ID,
      timestamp: timestamp,
    };
    const aiOutput: SuggestFeedbackOutput = await suggestFeedback(aiInput);
    aiSuggestion = aiOutput.feedbackSuggestion;
    console.log("AI Feedback Suggestion:", aiSuggestion);
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    // Proceed without AI feedback if it fails
  }
  
  // In a real app, save studentAnswerData to Firestore
  // For this prototype, we return it to be handled client-side
  return { 
    success: true, 
    submittedAnswer: studentAnswerData,
    aiFeedbackSuggestion: aiSuggestion 
  };
}


interface SubmitFeedbackResult {
  success: boolean;
  feedback?: LessonFeedback;
  error?: string;
}

export async function submitLessonFeedbackAction(
  feedbackData: Omit<LessonFeedback, 'timestamp'>
): Promise<SubmitFeedbackResult> {
  const timestamp = new Date().toISOString();
  const fullFeedbackData: LessonFeedback = {
    ...feedbackData,
    studentId: MOCK_STUDENT_ID, // Use mock student ID
    timestamp,
  };

  // Log data that would be saved
  console.log("Lesson feedback submitted (simulated):", fullFeedbackData);
  
  // In a real app, save fullFeedbackData to Firestore
  return { success: true, feedback: fullFeedbackData };
}


interface BookSessionResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export async function bookSessionAction(
  bookingDetails: Omit<Booking, 'id' | 'studentId' | 'googleMeetLink' | 'status' | 'tutorId'>
): Promise<BookSessionResult> {
  const newBooking: Booking = {
    ...bookingDetails,
    id: `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    studentId: MOCK_STUDENT_ID,
    tutorId: "tutor456", // Mock tutor ID
    googleMeetLink: `https://meet.google.com/lookup/mock-${Math.random().toString(36).substring(7)}`, // Mock Google Meet link
    status: 'Confirmed', 
  };

  // Log data that would be saved and used to create calendar events
  console.log("Session booked (simulated):", newBooking);
  console.log("Google Meet link generated (simulated):", newBooking.googleMeetLink);
  
  // In a real app, save newBooking to Firestore and use Google Calendar API
  return { success: true, booking: newBooking };
}
