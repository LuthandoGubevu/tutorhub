
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LessonFeedback } from '@/types';
import { submitLessonFeedbackAction } from '@/lib/actions';


interface FeedbackFormProps {
  lessonId: string;
  studentId: string; // Mock student ID
}

export default function FeedbackForm({ lessonId, studentId }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const feedbackData: Omit<LessonFeedback, 'timestamp'> = {
      lessonId,
      studentId,
      rating,
      comments,
    };
    
    try {
      await submitLessonFeedbackAction(feedbackData);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
      });
      setRating(0);
      setComments('');
    } catch (error) {
      toast({
        title: "Error Submitting Feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <CardTitle>Lesson Feedback</CardTitle>
        <CardDescription>Help us improve! Share your thoughts on this lesson (1-minute).</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block font-medium">Overall Rating:</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer h-7 w-7 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="feedback-comments" className="font-medium">Comments (Optional):</Label>
            <Textarea
              id="feedback-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did you like or dislike? Any suggestions?"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
