
"use client";

import AppLayout from '@/components/AppLayout';
import { useStudentData } from '@/contexts/StudentDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle, Clock, ExternalLink, BookOpen, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { submittedWork, bookings } = useStudentData();

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Welcome to EduPrep Pro!</CardTitle>
            <CardDescription className="text-lg">Your personalized learning hub for Mathematics and Physics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate using the sidebar to explore lessons, submit your work, and book tutoring sessions.</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="text-primary" /> Submitted Work</CardTitle>
              <CardDescription>Review your recently submitted answers and tutor feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              {submittedWork.length === 0 ? (
                <p className="text-muted-foreground">No answers submitted yet. Complete a lesson to see your work here!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-4">
                    {submittedWork.map((work) => (
                      <li key={work.id} className="p-4 border rounded-lg bg-secondary/30 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{work.lesson.title}</h3>
                            <p className="text-sm text-muted-foreground">Subject: {work.lesson.subject}</p>
                            <p className="text-sm text-muted-foreground">Submitted: {new Date(work.submittedAt).toLocaleDateString()}</p>
                             <Badge variant={work.status === 'Reviewed' ? 'default' : 'secondary'} className="mt-1">
                              {work.status === 'Reviewed' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                              {work.status}
                            </Badge>
                          </div>
                           <Link href={`/${work.lesson.subject.toLowerCase()}/${work.lesson.id}?submissionId=${work.id}`} passHref>
                             <Button variant="outline" size="sm">View <ExternalLink size={14} className="ml-1"/></Button>
                           </Link>
                        </div>
                        {work.tutorFeedback && (
                          <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 rounded">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Tutor Feedback:</p>
                            <p className="text-sm text-green-600 dark:text-green-400">{work.tutorFeedback}</p>
                          </div>
                        )}
                         {work.aiFeedbackSuggestion && !work.tutorFeedback && (
                          <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 rounded">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">AI Suggested Focus:</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{work.aiFeedbackSuggestion}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="text-primary" /> Booked Sessions</CardTitle>
              <CardDescription>Manage your upcoming tutoring sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground">No sessions booked. Visit the 'Book a Session' page to schedule one.</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-4">
                    {bookings.map((booking) => (
                      <li key={booking.id} className="p-4 border rounded-lg bg-secondary/30 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg">Session for {booking.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(booking.dateTime).toLocaleDateString()} at {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-muted-foreground">Duration: {booking.durationMinutes} minutes</p>
                        <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'} className="mt-1">
                          {booking.status}
                        </Badge>
                        {booking.googleMeetLink && (
                          <Button variant="link" asChild className="p-0 h-auto mt-1">
                            <a href={booking.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              Join Meeting <ExternalLink size={14} className="ml-1"/>
                            </a>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
