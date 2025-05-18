
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStudentData } from '@/contexts/StudentDataContext';
import type { SubmittedWork } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckSquare, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { updateSubmissionByTutorAction } from '@/lib/actions';
import Link from 'next/link';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { submissionId } = params as { submissionId: string };
  
  const { submittedWork, updateSubmittedWork: updateContextSubmission } = useStudentData();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<SubmittedWork | undefined>(undefined);
  const [tutorFeedback, setTutorFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (submissionId && submittedWork.length > 0) {
      const foundSubmission = submittedWork.find(s => s.id === submissionId);
      setSubmission(foundSubmission);
      if (foundSubmission?.tutorFeedback) {
        setTutorFeedback(foundSubmission.tutorFeedback);
      }
    }
  }, [submissionId, submittedWork]);

  const handleSaveFeedback = async () => {
    if (!submission) return;
    setIsSubmitting(true);

    // In a real app, you'd likely call a server action that updates Firestore.
    // For the prototype, we'll call an action that simulates this and then update context.
    const result = await updateSubmissionByTutorAction(
      submission.id, 
      tutorFeedback, 
      'Reviewed',
      submittedWork // Pass current submissions for the action to find and "update"
    );

    if (result.success && result.updatedSubmission) {
      // Update the context with the result from the action
      updateContextSubmission(submission.id, result.updatedSubmission);
      setSubmission(result.updatedSubmission); // Update local state for immediate UI reflect
      toast({
        title: "Feedback Saved",
        description: "The submission has been marked as reviewed and feedback saved.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not save feedback.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading submission details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft size={16} className="mr-2" /> Back to Submissions
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{submission.lesson.title}</CardTitle>
          <CardDescription>
            Lesson: {submission.lesson.subject} <br />
            Student ID: {submission.studentId} <br />
            Submitted: {format(new Date(submission.submittedAt), "PPPp")} <br />
            Status: <span className={`font-semibold ${submission.status === 'Reviewed' ? 'text-green-600' : 'text-orange-500'}`}>{submission.status}</span>
            {submission.score && ` (Score: ${submission.score}%)`}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student's Answer</CardTitle>
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
          <CardTitle className="flex items-center"><MessageSquare size={20} className="mr-2 text-primary"/> Provide Feedback</CardTitle>
          <CardDescription>Enter your feedback for the student below. This will be visible to them once saved.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tutorFeedback">Your Feedback</Label>
            <Textarea
              id="tutorFeedback"
              value={tutorFeedback}
              onChange={(e) => setTutorFeedback(e.target.value)}
              placeholder="Enter your constructive feedback here..."
              className="min-h-[150px]"
              disabled={submission.status === 'Reviewed' && !isSubmitting} // Optionally disable if already reviewed
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveFeedback} 
            disabled={isSubmitting || (submission.status === 'Reviewed' && tutorFeedback === submission.tutorFeedback)}
            className="bg-accent hover:bg-accent/90"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare size={16} className="mr-2" />}
            {submission.status === 'Reviewed' && tutorFeedback === submission.tutorFeedback ? 'Feedback Saved' : (submission.status === 'Reviewed' ? 'Update Feedback' : 'Mark as Reviewed & Save')}
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

