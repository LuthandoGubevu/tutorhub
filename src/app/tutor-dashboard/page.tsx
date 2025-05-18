
"use client";

import { useStudentData } from '@/contexts/StudentDataContext';
import type { SubmittedWork } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, ListChecks } from 'lucide-react';

export default function TutorDashboardPage() {
  const { submittedWork } = useStudentData();

  // Sort submissions by date, most recent first
  const sortedSubmissions = [...submittedWork].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-4xl font-bold flex items-center"><ListChecks size={40} className="mr-3"/>Tutor Dashboard</CardTitle>
          <CardDescription className="text-lg text-primary-foreground/90">
            Review student submissions and provide feedback.
          </CardDescription>
        </CardHeader>
      </Card>

      {sortedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No student submissions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSubmissions.map((submission: SubmittedWork) => (
            <Card key={submission.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{submission.lesson.title}</CardTitle>
                <CardDescription>
                  Student ID: {submission.studentId} <br />
                  Submitted: {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-1">Status:</p>
                <Badge variant={submission.status === 'Reviewed' ? 'default' : 'secondary'}>
                  {submission.status}
                </Badge>
                {submission.score && (
                   <p className="text-sm text-muted-foreground mt-2">Score: <span className="font-semibold">{submission.score}%</span></p>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button asChild className="w-full bg-accent hover:bg-accent/90">
                  <Link href={`/tutor-dashboard/submission/${submission.id}`}>
                    <Eye size={16} className="mr-2"/> View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
