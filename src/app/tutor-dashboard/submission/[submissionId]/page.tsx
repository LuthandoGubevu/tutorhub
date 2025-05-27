
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SubmittedWork, SubmittedWorkFirestoreData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckSquare, Loader2, MessageSquare, Brain } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { updateSubmissionByTutorAction } from '@/lib/actions';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { getLessonById } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { submissionId } = params as { submissionId: string };
  const { currentUser } = useAuth();
  
  const { toast } = useToast();

  const [submission, setSubmission] = useState<SubmittedWork | undefined>(undefined);
  const [tutorFeedback, setTutorFeedback] = useState('');
  const [currentScore, setCurrentScore] = useState<string>(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (submissionId && currentUser?.role === 'tutor') { // Ensure tutor is fetching
      setIsLoading(true);
      const unsub = onSnapshot(doc(db, "submittedWork", submissionId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SubmittedWorkFirestoreData;
          const lessonDetail = getLessonById(data.lessonSubject, data.lessonId);

          if (lessonDetail) {
            const currentSubmissionData: SubmittedWork = {
              id: docSnap.id,
              ...data,
              lesson: lessonDetail,
              submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
            };
            setSubmission(currentSubmissionData);
            setTutorFeedback(currentSubmissionData.tutorFeedback || '');
            setCurrentScore(currentSubmissionData.score !== undefined ? String(currentSubmissionData.score) : '');
          } else {
            console.error(`Lesson details not found for submission ${submissionId}`);
            setSubmission(undefined);
            toast({ title: "Error", description: "Could not load lesson details for this submission.", variant: "destructive"});
          }
        } else {
          console.log("No such submission!");
          setSubmission(undefined);
          toast({ title: "Not Found", description: "Submission not found.", variant: "destructive"});
          router.replace('/tutor-dashboard'); // Redirect if submission doesn't exist
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching submission for tutor:", error);
        setIsLoading(false);
        toast({ title: "Error", description: "Could not load submission details.", variant: "destructive" });
      });
      return () => unsub();
    } else if (currentUser?.role !== 'tutor' && currentUser !== null) {
        // If not a tutor, redirect away
        router.replace('/dashboard');
    }
  }, [submissionId, currentUser, router, toast]);

  const handleSaveFeedback = async () => {
    if (!submission) return;
    setIsSubmitting(true);

    let scoreToSave: number | undefined = undefined;
    if (currentScore.trim() !== '') {
      const parsedScore = parseFloat(currentScore);
      if (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100) {
        scoreToSave = parsedScore;
      } else {
        toast({
          title: "Invalid Score",
          description: "Score must be a number between 0 and 100.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    const result = await updateSubmissionByTutorAction(
      submission.id, 
      tutorFeedback, 
      'Reviewed',
      scoreToSave
    );

    if (result.success) {
      // No need to update local state for submission, onSnapshot will handle it.
      toast({
        title: "Feedback & Score Saved",
        description: "The submission has been marked as reviewed, and feedback/score saved.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not save feedback and score.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };
  
  if (isLoading || !submission && submissionId) { // Keep loading if submissionId exists but submission is not yet loaded
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading submission details...</p>
      </div>
    );
  }

  if (!submission) {
     // This case handles if submissionId was invalid or submission doesn't exist and loading is complete
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-destructive">Submission not found.</p>
        <Button onClick={() => router.push('/tutor-dashboard')} variant="outline" className="mt-4">
          Return to Tutor Dashboard
        </Button>
      </div>
    );
  }


  const isAlreadyReviewed = submission.status === 'Reviewed';
  // Check if current form state is different from the saved submission state
  const hasChanges = tutorFeedback !== (submission.tutorFeedback || '') || 
                     currentScore !== (submission.score !== undefined ? String(submission.score) : '');

  const isSaveDisabled = isSubmitting || (isAlreadyReviewed && !hasChanges);


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft size={16} className="mr-2" /> Back to Submissions
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{submission.lessonTitle}</CardTitle>
          <CardDescription>
            Lesson: {submission.lessonSubject} <br />
            Student ID: {submission.studentId} <br />
            Submitted: {format(parseISO(submission.submittedAt), "PPPp")} <br />
            Status: <span className={`font-semibold ${submission.status === 'Reviewed' ? 'text-green-600' : 'text-orange-500'}`}>{submission.status}</span>
            {submission.score !== undefined && (
              <span className="ml-2">(Score: <span className="font-bold">{submission.score}%</span>)</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {submission.studentReasoning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Brain size={18} className="mr-2 text-primary"/>Student's Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">{submission.studentReasoning}</pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student's Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">{submission.studentAnswer}</pre>
        </CardContent>
      </Card>

      {submission.aiFeedbackSuggestion && (
        <Card className="border-blue-500 border-l-4">
          <CardHeader>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400">AI Feedback Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{submission.aiFeedbackSuggestion}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MessageSquare size={20} className="mr-2 text-primary"/> Provide Feedback & Grade</CardTitle>
          <CardDescription>Enter your feedback and a score (0-100) for the student below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tutorFeedback">Your Feedback</Label>
            <Textarea
              id="tutorFeedback"
              value={tutorFeedback}
              onChange={(e) => setTutorFeedback(e.target.value)}
              placeholder="Enter your constructive feedback here..."
              className="min-h-[150px]"
              disabled={isSubmitting} 
            />
          </div>
          <div>
            <Label htmlFor="submissionScore">Score (0-100)</Label>
            <Input
              id="submissionScore"
              type="number"
              min="0"
              max="100"
              value={currentScore}
              onChange={(e) => setCurrentScore(e.target.value)}
              placeholder="Enter score"
              className="w-full md:w-1/3"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveFeedback} 
            disabled={isSaveDisabled}
            className="bg-accent hover:bg-accent/90"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare size={16} className="mr-2" />}
            {isAlreadyReviewed && hasChanges ? 'Update Feedback/Score' : 
             isAlreadyReviewed && !hasChanges ? 'Feedback & Score Saved' : 
             'Mark as Reviewed & Save'}
          </Button>
        </CardFooter>
      </Card>
       <div className="text-center mt-8">
          <Link href="/tutor-dashboard" legacyBehavior>
            <a className="text-sm text-muted-foreground hover:text-primary underline">
              Return to Main Tutor Dashboard
            </a>
          </Link>
        </div>
    </div>
  );
}
