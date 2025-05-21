
'use server';

/**
 * @fileOverview AI-powered student answer analysis for tutors.
 *
 * - suggestFeedback - Analyzes student answers and provides feedback suggestions for tutors.
 * - SuggestFeedbackInput - The input type for the suggestFeedback function.
 * - SuggestFeedbackOutput - The return type for the suggestFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFeedbackInputSchema = z.object({
  lessonContent: z.string().describe('The content of the lesson the student is answering questions about.'),
  studentAnswer: z.string().describe('The student\'s answer to the math question.'),
  studentReasoning: z.string().optional().describe('The student\'s explanation of their thought process.'), // Added
  lessonId: z.string().describe('The ID of the lesson.'),
  studentId: z.string().describe('The ID of the student.'),
  timestamp: z.string().describe('The timestamp of the submission.'),
});
export type SuggestFeedbackInput = z.infer<typeof SuggestFeedbackInputSchema>;

const SuggestFeedbackOutputSchema = z.object({
  feedbackSuggestion: z.string().describe('AI-generated feedback suggestion for the tutor.'),
});
export type SuggestFeedbackOutput = z.infer<typeof SuggestFeedbackOutputSchema>;

export async function suggestFeedback(input: SuggestFeedbackInput): Promise<SuggestFeedbackOutput> {
  return suggestFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFeedbackPrompt',
  input: {schema: SuggestFeedbackInputSchema},
  output: {schema: SuggestFeedbackOutputSchema},
  prompt: `You are an AI assistant that helps tutors provide effective feedback to students.

  Analyze the student's answer AND THEIR REASONING (if provided) in the context of the lesson content.
  Provide a concise feedback suggestion for the tutor.
  The feedback suggestion should focus on specific areas where the student might be struggling, considering both their final answer and their thought process.

  Lesson Content: {{{lessonContent}}}
  Student Answer: {{{studentAnswer}}}
  {{#if studentReasoning}}
  Student Reasoning: {{{studentReasoning}}}
  {{/if}}
  Lesson ID: {{{lessonId}}}
  Student ID: {{{studentId}}}
  Timestamp: {{{timestamp}}}

  Based on all the above, provide a Feedback Suggestion: `,
});

const suggestFeedbackFlow = ai.defineFlow(
  {
    name: 'suggestFeedbackFlow',
    inputSchema: SuggestFeedbackInputSchema,
    outputSchema: SuggestFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
