
"use client";

import type { Lesson, SubmittedWork, SubmittedWorkFirestoreData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import MathInput from './MathInput';
import FeedbackForm from './FeedbackForm';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { submitAnswerAction } from '@/lib/actions';
import { getLessonById } from '@/lib/data';
import { Loader2, Send, CheckCircle, HelpCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';

interface LessonDisplayProps {
  lesson: Lesson;
  initialSubmissionId?: string | null;
}

export default function LessonDisplay({ lesson, initialSubmissionId }: LessonDisplayProps) {
  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [currentSubmission, setCurrentSubmission] = useState<SubmittedWork | undefined>(undefined);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);

  useEffect(() => {
    if (initialSubmissionId && currentUser?.uid) {
      setIsLoadingSubmission(true);
      const unsub = onSnapshot(doc(db, "submittedWork", initialSubmissionId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SubmittedWorkFirestoreData;
          // Ensure student can only view their own past submission via URL
          if (data.studentId === currentUser.uid) {
            const fetchedLesson = getLessonById(data.lessonSubject, data.lessonId);
            if (fetchedLesson) {
              setCurrentSubmission({
                id: docSnap.id,
                ...data,
                lesson: fetchedLesson,
                submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
              });
              setAnswer(data.studentAnswer);
              setReasoning(data.studentReasoning || '');
            } else {
               console.error("Lesson for submission not found");
               setCurrentSubmission(undefined); // Or handle error
            }
          } else {
            console.warn("Attempted to load submission not owned by current user.");
            setCurrentSubmission(undefined);
            // Optionally redirect or show an error
          }
        } else {
          console.log("No such submission!");
          setCurrentSubmission(undefined);
        }
        setIsLoadingSubmission(false);
      }, (error) => {
        console.error("Error fetching submission:", error);
        setIsLoadingSubmission(false);
        toast({ title: "Error", description: "Could not load past submission.", variant: "destructive" });
      });
      return () => unsub();
    } else {
      // Reset for a new submission attempt
      setAnswer('');
      setReasoning('');
      setCurrentSubmission(undefined);
      setIsLoadingSubmission(false);
    }
  }, [initialSubmissionId, currentUser?.uid, lesson.id]); // lesson.id to reset if navigating between lessons but keeping same page structure


  const handleSubmitAnswer = async () => {
    if (!currentUser?.uid) {
      toast({ title: "Error", description: "You must be logged in to submit an answer.", variant: "destructive" });
      return;
    }
    if (!answer.trim()) {
      toast({ title: "Answer Required", description: "Please enter your answer before submitting.", variant: "destructive" });
      return;
    }
    if (!reasoning.trim()) {
      toast({ title: "Reasoning Required", description: "Please explain your reasoning before submitting.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const result = await submitAnswerAction(lesson.id, answer, reasoning, lesson.subject, currentUser.uid);
    setIsSubmitting(false);

    if (result.success && result.submissionId) {
      toast({ title: "Answer Submitted!", description: "Your answer and reasoning have been saved. AI feedback (if any) is available." });
      // The currentSubmission state will update via the Firestore listener if initialSubmissionId was set to this new ID,
      // or the user can navigate to see it. For now, we just show a success message.
      // If we want to immediately show the submitted work, we could set initialSubmissionId or navigate.
      // For simplicity, we let the listener handle updates if the user is already viewing that submission.
      // Or, more simply, set currentSubmission based on the result:
      setCurrentSubmission({
        id: result.submissionId,
        studentId: currentUser.uid,
        studentAnswer: answer,
        studentReasoning: reasoning,
        submittedAt: new Date().toISOString(), // This is client time, Firestore has server time. Listener will correct.
        aiFeedbackSuggestion: result.aiFeedbackSuggestion,
        status: 'Pending',
        lesson: lesson,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSubject: lesson.subject,
      });
      
    } else {
      toast({ title: "Submission Failed", description: result.error || "Could not submit your answer. Please try again.", variant: "destructive" });
    }
  };
  
  const isReadOnly = !!currentSubmission;

  if (isLoadingSubmission && initialSubmissionId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading previous submission...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-6">
          <CardTitle className="text-3xl md:text-4xl font-bold">{lesson.title}</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">Subject: {lesson.subject}</CardDescription>
        </CardHeader>
        
        {lesson.videoUrl && (
          <CardContent className="p-0">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={lesson.videoUrl}
                title={`${lesson.title} Video Lesson`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </AspectRatio>
          </CardContent>
        )}
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Lesson Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-lg max-w-none dark:prose-invert" 
            dangerouslySetInnerHTML={{ __html: lesson.richTextContent }} 
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Question</CardTitle>
          <CardDescription>{lesson.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="student-reasoning" className="text-lg font-medium">Your Reasoning:</Label>
            <Textarea
              id="student-reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain your thought process and how you arrived at your solution..."
              className="min-h-[120px] text-base"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
             {isReadOnly && currentSubmission && !currentSubmission.studentReasoning && (
              <p className="mt-2 text-sm text-muted-foreground">No reasoning was provided for this submission.</p>
            )}
          </div>
          <MathInput 
            value={answer} 
            onChange={setAnswer} 
            label="Your Solution:"
            readOnly={isReadOnly}
          />
          {isReadOnly && currentSubmission && (
             <p className="mt-2 text-sm text-muted-foreground">You submitted this answer on {new Date(currentSubmission.submittedAt).toLocaleString()}.</p>
          )}
        </CardContent>
        {!isReadOnly && (
          <CardContent> {/* Changed from CardFooter to CardContent for button placement */}
            <div className="flex justify-end space-x-3">
              {lesson.exampleSolution && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline"><HelpCircle size={16} className="mr-2"/> Show Example Solution</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Example Solution</AlertDialogTitle>
                      <AlertDialogDescription>
                        This is an example solution. Try to solve it on your own first!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="p-4 bg-muted rounded-md my-4">
                      <pre className="whitespace-pre-wrap text-sm">{lesson.exampleSolution}</pre>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={handleSubmitAnswer} disabled={isSubmitting || !currentUser} className="bg-accent hover:bg-accent/80">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                Submit Answer & Reasoning
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {currentSubmission && (
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center"><CheckCircle className="text-green-500 mr-2" /> Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentSubmission.studentReasoning && (
              <div>
                <h4 className="font-medium">Your Reasoning:</h4>
                <p className="p-3 bg-secondary rounded-md whitespace-pre-wrap">{currentSubmission.studentReasoning}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium">Your Answer:</h4>
              <p className="p-3 bg-secondary rounded-md whitespace-pre-wrap">{currentSubmission.studentAnswer}</p>
            </div>
            {currentSubmission.aiFeedbackSuggestion && (
              <div>
                <h4 className="font-medium">AI Feedback Suggestion:</h4>
                <p className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md border border-blue-300 dark:border-blue-700">{currentSubmission.aiFeedbackSuggestion}</p>
              </div>
            )}
            {currentSubmission.tutorFeedback && (
              <div>
                <h4 className="font-medium">Tutor Feedback:</h4>
                <p className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md border border-green-300 dark:border-green-700">{currentSubmission.tutorFeedback}</p>
              </div>
            )}
             <p className="text-sm text-muted-foreground">Status: {currentSubmission.status} {currentSubmission.score !== undefined && `(Score: ${currentSubmission.score}%)`}</p>
          </CardContent>
        </Card>
      )}

      <FeedbackForm lessonId={lesson.id} studentId={currentUser?.uid || "student_anonymous"} />
    </div>
  );
}
