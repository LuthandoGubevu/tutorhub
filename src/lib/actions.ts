
"use server";

import { suggestFeedback, type SuggestFeedbackInput, type SuggestFeedbackOutput } from '@/ai/flows/suggest-feedback';
import type { StudentAnswer, LessonFeedback, Booking, Lesson, SubmittedWork } from '@/types';
import { getLessonById } from './data';

// Simulate student ID for now
const MOCK_STUDENT_ID = "student123"; // This will be overridden by actual logged-in user if available

interface SubmitAnswerResult {
  success: boolean;
  submittedAnswer?: StudentAnswer; // This might be slightly redundant if SubmittedWork is the main return
  newSubmission?: SubmittedWork;
  aiFeedbackSuggestion?: string;
  error?: string;
}

export async function submitAnswerAction(
  lessonId: string,
  answer: string,
  subject: 'Mathematics' | 'Physics',
  studentId: string // Pass the actual student ID
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
    studentId: studentId, // Use passed studentId
    answer,
    timestamp,
  };

  // Log data that would be sent to the tutor
  console.log("Answer submitted (simulated):", studentAnswerData);

  // Call AI flow
  let aiSuggestion: string | undefined;
  try {
    const aiInput: SuggestFeedbackInput = {
      lessonContent: lesson.richTextContent,
      studentAnswer: answer,
      lessonId: lessonId,
      studentId: studentId, // Use passed studentId
      timestamp: timestamp,
    };
    const aiOutput: SuggestFeedbackOutput = await suggestFeedback(aiInput);
    aiSuggestion = aiOutput.feedbackSuggestion;
    console.log("AI Feedback Suggestion:", aiSuggestion);
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    // Proceed without AI feedback if it fails
  }
  
  const newSubmissionData: SubmittedWork = {
    id: `submission-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    lesson: lesson,
    studentId: studentId, // Ensure studentId is here
    studentAnswer: answer,
    submittedAt: timestamp,
    aiFeedbackSuggestion: aiSuggestion,
    status: 'Pending',
  };
  
  return { 
    success: true, 
    newSubmission: newSubmissionData,
    aiFeedbackSuggestion: aiSuggestion // Retained for direct access if needed immediately after action
  };
}


interface SubmitFeedbackResult {
  success: boolean;
  feedback?: LessonFeedback;
  error?: string;
}

export async function submitLessonFeedbackAction(
  feedbackData: Omit<LessonFeedback, 'timestamp' | 'studentId'>, // studentId will be passed
  studentId: string
): Promise<SubmitFeedbackResult> {
  const timestamp = new Date().toISOString();
  const fullFeedbackData: LessonFeedback = {
    ...feedbackData,
    studentId: studentId, 
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
  bookingDetails: Omit<Booking, 'id' | 'studentId' | 'googleMeetLink' | 'status' | 'tutorId'>,
  studentId: string
): Promise<BookSessionResult> {
  const newBooking: Booking = {
    ...bookingDetails,
    id: `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    studentId: studentId,
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


// Action for tutor to update submission (add feedback, change status)
interface UpdateSubmissionResult {
  success: boolean;
  updatedSubmission?: SubmittedWork;
  error?: string;
}

export async function updateSubmissionByTutorAction(
  submissionId: string,
  tutorFeedback: string,
  newStatus: 'Reviewed' | 'Pending', // Tutors would likely only mark as 'Reviewed'
  currentSubmissions: SubmittedWork[] // Pass current submissions to find and update
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
    score: newStatus === 'Reviewed' && typeof submissionToUpdate.score === 'undefined' 
           ? (Math.floor(Math.random() * 41) + 60) // Assign mock score if reviewed and no score
           : submissionToUpdate.score, 
  };
  
  console.log("Submission updated by tutor (simulated):", updatedSubmission);
  // In a real app, update in Firestore.
  // For prototype, this action helps structure what would be saved.
  // The actual update to StudentDataContext will happen client-side after this action returns.
  return { success: true, updatedSubmission };
}
