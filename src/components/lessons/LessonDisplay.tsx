
"use client";

import type { Lesson, SubmittedWork } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import MathInput from './MathInput';
import FeedbackForm from './FeedbackForm';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useStudentData } from '@/contexts/StudentDataContext';
import { useToast } from '@/hooks/use-toast';
import { submitAnswerAction } from '@/lib/actions';
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

interface LessonDisplayProps {
  lesson: Lesson;
  initialSubmissionId?: string | null;
}

export default function LessonDisplay({ lesson, initialSubmissionId }: LessonDisplayProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSubmittedWork, submittedWork, updateSubmittedWork } = useStudentData();
  const { toast } = useToast();
  const [currentSubmission, setCurrentSubmission] = useState<SubmittedWork | undefined>(undefined);

  useEffect(() => {
    if (initialSubmissionId) {
      const existingSubmission = submittedWork.find(s => s.id === initialSubmissionId);
      if (existingSubmission) {
        setAnswer(existingSubmission.studentAnswer);
        setCurrentSubmission(existingSubmission);
      }
    } else {
      // Reset for a new submission if no initialSubmissionId or if lesson changes
      setAnswer('');
      setCurrentSubmission(undefined);
      // const lastSubmissionForThisLesson = submittedWork.find(s => s.lesson.id === lesson.id);
      // if (lastSubmissionForThisLesson) {
      // }
    }
  }, [initialSubmissionId, submittedWork, lesson.id]);


  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast({ title: "Answer Required", description: "Please enter your answer before submitting.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const result = await submitAnswerAction(lesson.id, answer, lesson.subject);
    setIsSubmitting(false);

    if (result.success && result.submittedAnswer) {
      const newSubmission: SubmittedWork = {
        id: `submission-${Date.now()}`, // Ensure unique ID generation
        lesson: lesson,
        studentAnswer: result.submittedAnswer.answer,
        submittedAt: result.submittedAnswer.timestamp,
        aiFeedbackSuggestion: result.aiFeedbackSuggestion,
        status: 'Pending',
      };
      addSubmittedWork(newSubmission);
      setCurrentSubmission(newSubmission); 
      toast({ title: "Answer Submitted!", description: "Your answer has been saved. AI feedback (if any) is available." });
    } else {
      toast({ title: "Submission Failed", description: result.error || "Could not submit your answer. Please try again.", variant: "destructive" });
    }
  };
  
  const isReadOnly = !!currentSubmission;

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
        <CardContent>
          <MathInput 
            value={answer} 
            onChange={setAnswer} 
            label="Your Solution"
            readOnly={isReadOnly}
          />
          {isReadOnly && currentSubmission && (
             <p className="mt-2 text-sm text-muted-foreground">You submitted this answer on {new Date(currentSubmission.submittedAt).toLocaleString()}.</p>
          )}
        </CardContent>
        {!isReadOnly && (
          <CardContent>
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
              <Button onClick={handleSubmitAnswer} disabled={isSubmitting} className="bg-accent hover:bg-accent/80">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                Submit Answer
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
             <p className="text-sm text-muted-foreground">Status: {currentSubmission.status}</p>
          </CardContent>
        </Card>
      )}

      <FeedbackForm lessonId={lesson.id} studentId="student123" />
    </div>
  );
}

