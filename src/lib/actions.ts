
"use server";

import { suggestFeedback, type SuggestFeedbackInput, type SuggestFeedbackOutput } from '@/ai/flows/suggest-feedback';
import type { StudentAnswer, LessonFeedback, Booking, Lesson, SubmittedWork } from '@/types';
import { getLessonById } from './data';


interface SubmitAnswerResult {
  success: boolean;
  newSubmission?: SubmittedWork;
  aiFeedbackSuggestion?: string;
  error?: string;
}

export async function submitAnswerAction(
  lessonId: string,
  answer: string,
  reasoning: string, // Added reasoning parameter
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
      studentReasoning: reasoning, // Pass reasoning to AI
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
    studentReasoning: reasoning, // Save reasoning
    submittedAt: timestamp,
    aiFeedbackSuggestion: aiSuggestion,
    status: 'Pending',
  };
  
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

export async function submitLessonFeedbackAction(
  feedbackData: Omit<LessonFeedback, 'timestamp' | 'studentId'>, 
  studentId: string
): Promise<SubmitFeedbackResult> {
  const timestamp = new Date().toISOString();
  const fullFeedbackData: LessonFeedback = {
    ...feedbackData,
    studentId: studentId, 
    timestamp,
  };

  console.log("Lesson feedback submitted (simulated):", fullFeedbackData);
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
    studentId: studentId, // Use passed studentId
    tutorId: "tutor456", 
    googleMeetLink: `https://meet.google.com/lookup/mock-${Math.random().toString(36).substring(7)}`, 
    status: 'Confirmed', 
  };

  console.log("Session booked (simulated):", newBooking);
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
  currentSubmissions: SubmittedWork[] 
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
    score: score !== undefined ? score : submissionToUpdate.score, 
  };
  
  console.log("Submission updated by tutor (simulated):", updatedSubmission);
  return { success: true, updatedSubmission };
}
