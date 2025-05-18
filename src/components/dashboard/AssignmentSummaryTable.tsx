
"use client";

import type { SubmittedWork, Lesson } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface AssignmentSummaryTableProps {
  submittedWork: SubmittedWork[];
  allLessons: Lesson[];
  subject?: 'Mathematics' | 'Physics';
}

export default function AssignmentSummaryTable({ submittedWork, allLessons, subject }: AssignmentSummaryTableProps) {
  const relevantLessons = subject ? allLessons.filter(lesson => lesson.subject === subject) : allLessons;

  const displayItems = relevantLessons.map(lesson => {
    const submission = submittedWork.find(sw => sw.lesson.id === lesson.id);
    if (submission) {
      return {
        lessonName: submission.lesson.title,
        submissionStatus: submission.status === 'Reviewed' ? 'Completed' : 'Pending Review',
        grade: submission.score !== undefined ? `${submission.score}%` : (submission.status === 'Reviewed' ? 'Graded' : 'N/A'),
        feedbackStatus: submission.tutorFeedback ? 'Reviewed' : (submission.aiFeedbackSuggestion ? 'AI Suggestion' : 'Awaiting Feedback'),
        submittedAt: submission.submittedAt,
        lessonPath: `/${submission.lesson.subject.toLowerCase()}/${submission.lesson.id}?submissionId=${submission.id}`,
      };
    }
    return {
      lessonName: lesson.title,
      submissionStatus: 'Pending',
      grade: 'N/A',
      feedbackStatus: 'Not Submitted',
      lessonPath: `/${lesson.subject.toLowerCase()}/${lesson.id}`,
    };
  }).sort((a, b) => {
    if (a.submittedAt && b.submittedAt) return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    if (a.submittedAt) return -1;
    if (b.submittedAt) return 1;
    return 0;
  });


  if (displayItems.length === 0) {
    return <p className="text-muted-foreground">No assignments to display for {subject || 'any subject'}.</p>;
  }

  return (
    <ScrollArea className="h-96 rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Lesson Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Grade/Score</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayItems.map((item, index) => (
            <TableRow key={`${item.lessonName}-${index}`}>
              <TableCell className="font-medium">{item.lessonName}</TableCell>
              <TableCell>
                <Badge variant={item.submissionStatus === 'Completed' ? 'default' : (item.submissionStatus === 'Pending Review' ? 'secondary' : 'outline')}>
                  {item.submissionStatus}
                </Badge>
              </TableCell>
              <TableCell>{item.grade}</TableCell>
              <TableCell>
                 <Badge variant={item.feedbackStatus === 'Reviewed' ? 'default' : (item.feedbackStatus === 'AI Suggestion' ? 'secondary' : 'outline')} className={item.feedbackStatus === 'AI Suggestion' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}>
                    {item.feedbackStatus}
                  </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={item.lessonPath}>
                    {item.submissionStatus === 'Pending' ? 'Start Lesson' : 'View'}
                    <ExternalLink size={14} className="ml-1" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
